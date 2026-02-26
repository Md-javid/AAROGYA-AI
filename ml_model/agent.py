"""
agent.py — LangGraph Agentic Fitness Coach
Builds a stateful fitness coaching agent with four tools:
  1. analyze_user_data    — calls ML model API for predictions
  2. search_exercises     — returns exercise list for a focus area
  3. analyze_nutrition    — evaluates macros against daily goal
  4. recommend_plan       — synthesises full daily plan

Usage:
  python agent.py

Or import:
  from agent import run_fitness_agent
  result = run_fitness_agent({"age": 28, "weight": 72, ...})
"""
import os, requests
from typing import TypedDict, Annotated, Sequence
from dotenv import load_dotenv

load_dotenv()

# ── LangGraph / LangChain imports ───────────────────────────
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
import operator

ML_API = os.environ.get("ML_API_URL", "http://localhost:5001/api/ml/predict")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")

# ─────────────────────────────────────────────────────────────
# Agent state
# ─────────────────────────────────────────────────────────────
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_data: dict
    plan: dict


# ─────────────────────────────────────────────────────────────
# Tools
# ─────────────────────────────────────────────────────────────
EXERCISE_DB = {
    "strength":  ["Deadlifts", "Bench Press", "Barbell Rows", "Squats", "Overhead Press"],
    "cardio":    ["Running", "Jump Rope", "Cycling", "Rowing", "Burpees"],
    "mobility":  ["Hip Flexor Stretch", "Cat-Cow", "Thoracic Rotation", "Pigeon Pose", "Shoulder Rolls"],
    "recovery":  ["Foam Rolling", "Light Walking", "Deep Breathing", "Yoga Nidra", "Static Stretches"],
    "hiit":      ["Box Jumps", "Mountain Climbers", "Kettlebell Swings", "Sprint Intervals", "Jump Squats"],
}

@tool
def analyze_user_data(user_json: str) -> str:
    """
    Calls the Random Forest ML API with user biometrics/lifestyle data.
    Input: JSON string with keys age, weight, height, activity, sleep_hrs, stress,
           steps_k, water_l, diet_q, gender.
    Returns fitness score, calorie need, and workout intensity recommendation.
    """
    import json
    try:
        data = json.loads(user_json)
        resp = requests.post(ML_API, json=data, timeout=5)
        resp.raise_for_status()
        r = resp.json()
        return (
            f"Fitness Score: {r['fitness_score']}/100 | "
            f"Daily Calorie Need: {r['calorie_need']} kcal | "
            f"Recommended Intensity: {r['intensity_label']} | "
            f"BMI: {r['bmi']} | "
            f"Tips: {'; '.join(r['recommendations'])}"
        )
    except Exception as e:
        return f"ML API unavailable ({e}). Using default: Moderate intensity, 2000 kcal."


@tool
def search_exercises(focus: str) -> str:
    """
    Returns a list of exercises for the given focus area.
    focus must be one of: strength, cardio, mobility, recovery, hiit
    """
    key  = focus.lower().strip()
    exes = EXERCISE_DB.get(key, EXERCISE_DB["cardio"])
    return f"Exercises for {focus}: {', '.join(exes)}"


@tool
def analyze_nutrition(calories_consumed: int, protein_g: int, carbs_g: int, fat_g: int, calorie_goal: int) -> str:
    """
    Evaluates the user's daily nutrition intake against their calorie goal.
    Returns a short assessment and gap analysis.
    """
    gap   = calorie_goal - calories_consumed
    total = protein_g + carbs_g + fat_g
    pp    = round(protein_g * 4 / max(calories_consumed, 1) * 100)
    cp    = round(carbs_g   * 4 / max(calories_consumed, 1) * 100)
    fp    = round(fat_g     * 9 / max(calories_consumed, 1) * 100)

    status = "on track" if abs(gap) < 150 else ("under-eating" if gap > 150 else "over-eating")
    return (
        f"Status: {status} | Gap: {gap:+} kcal | "
        f"Macros — Protein: {pp}%, Carbs: {cp}%, Fat: {fp}% | "
        f"{'Increase protein-rich foods.' if pp < 25 else 'Good protein intake.'}"
    )


@tool
def recommend_plan(fitness_score: float, intensity_label: str, calorie_need: int) -> str:
    """
    Produces a full structured daily fitness + nutrition plan.
    """
    intensity_map = {
        "rest / recovery": ("🛌 Rest Day", ["Yoga Nidra 20 min", "Light Walk 15 min", "Foam Rolling"]),
        "light":           ("🚶 Light Day", ["Brisk Walk 30 min", "Mobility Flow 20 min", "Bodyweight Circuit x1"]),
        "moderate":        ("💪 Moderate Day", ["Warm-up 10 min", "Compound Lifts 3×10", "Cardio Finisher 15 min"]),
        "hard":            ("🔥 High Intensity", ["Dynamic Warm-up", "HIIT 25 min", "Heavy Compound Sets 4×6", "Cool-down Stretch"]),
    }
    label = intensity_label.lower()
    day_label, activities = next(
        ((v, a) for k, (v, a) in intensity_map.items() if k in label),
        ("💪 Moderate Day", ["Warm-up", "Full Body Circuit", "Cool-down"])
    )
    nutrition_split = f"Protein ~{int(calorie_need * 0.25 / 4)}g | Carbs ~{int(calorie_need * 0.45 / 4)}g | Fat ~{int(calorie_need * 0.30 / 9)}g"
    return (
        f"{day_label} | Score: {fitness_score}/100\n"
        f"Activities: {' → '.join(activities)}\n"
        f"Nutrition ({calorie_need} kcal): {nutrition_split}"
    )


# ─────────────────────────────────────────────────────────────
# Build LangGraph
# ─────────────────────────────────────────────────────────────
tools_list = [analyze_user_data, search_exercises, analyze_nutrition, recommend_plan]


def build_agent():
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=GEMINI_KEY,
        temperature=0.3,
    ).bind_tools(tools_list)

    tool_node = ToolNode(tools_list)

    def agent_node(state: AgentState):
        messages = state["messages"]
        response = llm.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: AgentState):
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue)
    graph.add_edge("tools", "agent")
    return graph.compile()


# ─────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────
def run_fitness_agent(user_data: dict) -> str:
    """
    Run the agentic fitness coach for a given user profile dict.
    Returns a full daily plan as a string.
    """
    import json
    agent = build_agent()
    system_prompt = (
        "You are Aarogya AI — an expert agentic fitness coach. "
        "Use the tools to analyse the user's data, then produce a personalised "
        "daily workout + nutrition plan. Be concise, friendly, and motivating."
    )
    user_msg = (
        f"Here is my health data: {json.dumps(user_data)}. "
        "Please analyse it with the ML model and give me a full daily plan."
    )
    result = agent.invoke({
        "messages": [
            HumanMessage(content=system_prompt + "\n\n" + user_msg)
        ],
        "user_data": user_data,
        "plan": {},
    })
    return result["messages"][-1].content


# ─────────────────────────────────────────────────────────────
# CLI demo
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    sample_user = {
        "age": 32, "weight": 78, "height": 175,
        "activity": 2, "sleep_hrs": 6.5, "stress": 6,
        "steps_k": 6, "water_l": 2, "diet_q": 3, "gender": 1,
    }
    print("🤖 Running Aarogya AI Fitness Agent …\n")
    plan = run_fitness_agent(sample_user)
    print(plan)
