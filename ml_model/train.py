"""
train.py — Random Forest Fitness Model
Trains a multi-output model to predict:
  1. fitness_score      (0–100)
  2. daily_calorie_need (kcal)
  3. workout_intensity  (0=rest, 1=light, 2=moderate, 3=hard)

Run:  python train.py
"""
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, accuracy_score

# ─────────────────────────────────────────────────────────────
# 1.  Synthetic training dataset
# ─────────────────────────────────────────────────────────────
np.random.seed(42)
N = 2000

age       = np.random.randint(18, 75, N)
weight    = np.random.uniform(40, 140, N)          # kg
height    = np.random.uniform(145, 200, N)          # cm
bmi       = weight / (height / 100) ** 2
activity  = np.random.choice([0, 1, 2, 3, 4], N)   # sedentary→very active
sleep_hrs = np.random.uniform(4, 10, N)
stress    = np.random.randint(1, 11, N)             # 1–10
steps_k   = np.random.uniform(0.5, 20, N)          # thousands/day
water_l   = np.random.uniform(0.5, 4, N)           # litres/day
diet_q    = np.random.randint(1, 6, N)             # 1=poor, 5=excellent
gender    = np.random.choice([0, 1], N)             # 0=F,1=M

# ── Derived targets ──────────────────────────────────────────
fitness_score = (
      (steps_k * 3)
    + (sleep_hrs * 4)
    - (stress * 2)
    + (activity * 8)
    + (diet_q * 5)
    - (np.clip(bmi - 22, 0, 20) * 1.5)
    + (water_l * 3)
).clip(0, 100)

calorie_bmr = np.where(
    gender == 1,
    88.362 + 13.397 * weight + 4.799 * height - 5.677 * age,
    447.593 + 9.247 * weight + 3.098 * height - 4.330 * age,
)
activity_mult = [1.2, 1.375, 1.55, 1.725, 1.9]
calorie_need  = calorie_bmr * np.array([activity_mult[a] for a in activity])

intensity_raw = (
      (fitness_score / 30)
    + (activity / 1.5)
    + (steps_k / 8)
).clip(0, 8)
intensity = pd.cut(
    intensity_raw, bins=[-np.inf, 2, 4, 6, np.inf],
    labels=[0, 1, 2, 3]
).astype(int)

# ── Assemble DataFrame ───────────────────────────────────────
df = pd.DataFrame({
    'age': age, 'weight': weight, 'height': height, 'bmi': bmi,
    'activity': activity, 'sleep_hrs': sleep_hrs, 'stress': stress,
    'steps_k': steps_k, 'water_l': water_l, 'diet_q': diet_q,
    'gender': gender,
    'fitness_score': fitness_score.round(1),
    'calorie_need': calorie_need.round(0),
    'intensity': intensity,
})

FEATURES = ['age','weight','height','bmi','activity','sleep_hrs','stress',
            'steps_k','water_l','diet_q','gender']
X  = df[FEATURES]
y_score     = df['fitness_score']
y_calories  = df['calorie_need']
y_intensity = df['intensity']

Xs, Xt, ys_s, ys_t, yc_s, yc_t, yi_s, yi_t = train_test_split(
    X, y_score, y_calories, y_intensity, test_size=0.2, random_state=42
)


# ─────────────────────────────────────────────────────────────
# 2.  Train models
# ─────────────────────────────────────────────────────────────
print("Training Random Forest — Fitness Score …")
rf_score = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1)
rf_score.fit(Xs, ys_s)
print(f"  MAE fitness_score : {mean_absolute_error(ys_t, rf_score.predict(Xt)):.2f}")

print("Training Random Forest — Calorie Need …")
rf_calories = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42, n_jobs=-1)
rf_calories.fit(Xs, yc_s)
print(f"  MAE calorie_need  : {mean_absolute_error(yc_t, rf_calories.predict(Xt)):.0f} kcal")

print("Training Random Forest — Workout Intensity …")
rf_intensity = RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1)
rf_intensity.fit(Xs, yi_s)
print(f"  Accuracy intensity: {accuracy_score(yi_t, rf_intensity.predict(Xt)):.3f}")


# ─────────────────────────────────────────────────────────────
# 3.  Save to disk
# ─────────────────────────────────────────────────────────────
out = Path(__file__).parent / "models"
out.mkdir(exist_ok=True)

joblib.dump(rf_score,   out / "rf_fitness_score.joblib")
joblib.dump(rf_calories, out / "rf_calories.joblib")
joblib.dump(rf_intensity, out / "rf_intensity.joblib")
joblib.dump(FEATURES,   out / "feature_names.joblib")

print(f"\n✅  Models saved to {out}/")
print("Run `python model_server.py` to start the prediction API.")
