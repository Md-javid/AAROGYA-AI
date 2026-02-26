"""
model_server.py — Flask API that serves Random Forest predictions
Endpoint: POST /api/ml/predict
Body (JSON):
  {
    "age": 30, "weight": 70, "height": 170,
    "activity": 2,        # 0=sedentary … 4=very active
    "sleep_hrs": 7,
    "stress": 5,          # 1–10
    "steps_k": 8,         # thousands/day
    "water_l": 2.5,       # litres
    "diet_q": 3,          # 1–5
    "gender": 1           # 0=F, 1=M
  }
Response:
  {
    "fitness_score": 72.4,
    "calorie_need": 2340,
    "intensity": 2,
    "intensity_label": "Moderate",
    "recommendations": ["..."]
  }

Start: python model_server.py
"""
import os, pathlib
import numpy as np
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

# ─────────────────────────────────────────────────────────────
BASE = pathlib.Path(__file__).parent / "models"
INTENSITY_LABELS = {0: "Rest / Recovery", 1: "Light", 2: "Moderate", 3: "Hard"}

def load_models():
    if not (BASE / "rf_fitness_score.joblib").exists():
        raise FileNotFoundError(
            "Models not found. Run  `python train.py`  first."
        )
    return {
        "score":    joblib.load(BASE / "rf_fitness_score.joblib"),
        "calories": joblib.load(BASE / "rf_calories.joblib"),
        "intensity":joblib.load(BASE / "rf_intensity.joblib"),
        "features": joblib.load(BASE / "feature_names.joblib"),
    }

app = Flask(__name__)
CORS(app, origins=["http://localhost:3002", "http://localhost:5000"])
models = load_models()

# ─────────────────────────────────────────────────────────────
def build_recommendations(score: float, intensity: int, calorie: float, bmi: float) -> list[str]:
    tips = []
    if bmi > 27:
        tips.append("Focus on a 300–500 kcal/day deficit with 30 min cardio daily.")
    if bmi < 18.5:
        tips.append("Increase calorie intake with protein-rich foods. Target 5–6 meals/day.")
    if intensity == 0:
        tips.append("Your body needs rest today — opt for gentle stretching or yoga.")
    elif intensity == 1:
        tips.append("A light 20–30 min walk or yoga session suits you today.")
    elif intensity == 2:
        tips.append("Go for a moderate strength session — 3 sets × 10–12 reps per exercise.")
    else:
        tips.append("You're ready for a high-intensity day! HIIT or heavy compound lifts.")
    if score < 40:
        tips.append("Prioritise sleep (7–8 hrs) and hydration to boost your fitness score.")
    elif score > 80:
        tips.append("Great fitness level — maintain consistency and add progressive overload.")
    tips.append(f"Your estimated daily calorie need is {int(calorie)} kcal.")
    return tips


@app.route("/api/ml/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    try:
        features = models["features"]
        age      = float(data.get("age", 30))
        weight   = float(data.get("weight", 70))
        height   = float(data.get("height", 170))
        bmi      = weight / (height / 100) ** 2
        row = np.array([[
            age, weight, height, bmi,
            float(data.get("activity",   2)),
            float(data.get("sleep_hrs",  7)),
            float(data.get("stress",     5)),
            float(data.get("steps_k",    7)),
            float(data.get("water_l",  2.5)),
            float(data.get("diet_q",     3)),
            float(data.get("gender",     1)),
        ]])

        fitness_score = float(round(models["score"].predict(row)[0], 1))
        calorie_need  = float(round(models["calories"].predict(row)[0]))
        intensity     = int(models["intensity"].predict(row)[0])

        return jsonify({
            "fitness_score":   fitness_score,
            "calorie_need":    calorie_need,
            "intensity":       intensity,
            "intensity_label": INTENSITY_LABELS[intensity],
            "bmi":             round(bmi, 1),
            "recommendations": build_recommendations(fitness_score, intensity, calorie_need, bmi),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/ml/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": True})


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 5001))
    print(f"🤖 ML Model Server running on http://localhost:{port}")
    print("   Endpoint: POST /api/ml/predict")
    app.run(host="0.0.0.0", port=port, debug=False)
