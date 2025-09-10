# train_and_export_tflite.py
"""
This script demonstrates how to train a simple model on dummy health data and export it as a TensorFlow Lite model.
Replace the dummy data and model with your real data and architecture as needed.
"""
import numpy as np
import tensorflow as tf
from tensorflow import keras

# Feature order: [HEART_RATE, SLEEP_ASLEEP, SLEEP_DEEP, SLEEP_REM, SLEEP_LIGHT, SLEEP_AWAKE, WORKOUT, STEPS, SCREEN_TIME, SOCIAL_INTERACTION, OUTDOOR_TIME]
num_samples = 6000
num_features = 11
np.random.seed(42)

# Simulate realistic health data
heart_rate = np.random.normal(75, 12, num_samples)           # 60-110 bpm
sleep_asleep = np.random.normal(7, 1.5, num_samples)         # 3-11 hours
sleep_deep = np.random.normal(1.7, 0.5, num_samples)         # 0.3-3 hours
sleep_rem = np.random.normal(1.6, 0.5, num_samples)          # 0.3-3 hours
sleep_light = np.random.normal(4.2, 1.2, num_samples)        # 1-7 hours
sleep_awake = np.random.normal(0.6, 0.3, num_samples)        # 0-1.5 hour
workout = np.random.normal(35, 25, num_samples)              # 0-120 min
steps = np.random.normal(9000, 3000, num_samples)            # 1000-20000
screen_time = np.random.normal(3.5, 2, num_samples)          # 0-10 hours
social_interaction = np.random.normal(2.5, 1.2, num_samples) # 0-6 hours
outdoor_time = np.random.normal(2, 1.2, num_samples)         # 0-6 hours

X = np.stack([
    heart_rate, sleep_asleep, sleep_deep, sleep_rem, sleep_light, sleep_awake,
    workout, steps, screen_time, social_interaction, outdoor_time
], axis=1).astype(np.float32)

# Clip to realistic bounds
X[:, 0] = np.clip(X[:, 0], 50, 120)      # heart rate
X[:, 1] = np.clip(X[:, 1], 3, 12)        # sleep total
X[:, 2] = np.clip(X[:, 2], 0.2, 3)       # deep
X[:, 3] = np.clip(X[:, 3], 0.2, 3)       # rem
X[:, 4] = np.clip(X[:, 4], 1, 8)         # light
X[:, 5] = np.clip(X[:, 5], 0, 2)         # awake
X[:, 6] = np.clip(X[:, 6], 0, 120)       # workout
X[:, 7] = np.clip(X[:, 7], 1000, 20000)  # steps
X[:, 8] = np.clip(X[:, 8], 0, 10)        # screen time
X[:, 9] = np.clip(X[:, 9], 0, 8)         # social
X[:,10] = np.clip(X[:,10], 0, 8)         # outdoor

# Assign mood based on complex, multi-factor rules
mood = []
for row in X:
    hr, sleep, deep, rem, light, awake, workout, steps, screen, social, outdoor = row
    # Happy: great sleep, high steps, low screen, good workout, good social/outdoor
    if sleep >= 7.5 and steps >= 9000 and 60 <= hr <= 85 and screen < 4 and awake < 1 and workout > 30 and social > 1.5 and outdoor > 1.5:
        mood.append(0)
    # Neutral: decent sleep, decent steps, moderate everything
    elif sleep >= 6.5 and steps >= 7000 and 55 <= hr <= 90 and screen < 6 and workout > 15:
        mood.append(1)
    # Sad: low sleep, low steps, high awake, low social/outdoor
    elif sleep < 6 or steps < 5000 or hr > 95 or awake > 1.2 or social < 1 or outdoor < 1:
        mood.append(2)
    # Stressed: very low sleep, high HR, high screen, low workout, high awake
    elif sleep < 5 or hr > 100 or screen > 7 or workout < 10 or awake > 1.5:
        mood.append(3)
    # Add some noise for realism
    else:
        mood.append(np.random.choice([0,1,2,3], p=[0.25,0.25,0.25,0.25]))

# Balance classes
from collections import Counter
counts = Counter(mood)
min_count = min(counts.values())
balanced_idx = []
for label in range(4):
    idx = [i for i, m in enumerate(mood) if m == label]
    np.random.shuffle(idx)
    balanced_idx.extend(idx[:min_count])
X_bal = X[balanced_idx]
y_bal = np.array([mood[i] for i in balanced_idx])

# Normalize features (min-max scaling to 0-1, using training data ranges)
X_min = X_bal.min(axis=0)
X_max = X_bal.max(axis=0)
X_norm = (X_bal - X_min) / (X_max - X_min + 1e-8)

y_cat = keras.utils.to_categorical(y_bal, num_classes=4)

model = keras.Sequential([
    keras.layers.Input(shape=(num_features,)),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(32, activation='relu'),
    keras.layers.Dense(16, activation='relu'),
    keras.layers.Dense(4, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(X_norm, y_cat, epochs=50, batch_size=32, validation_split=0.15)

# Save normalization params for use in your app
np.savez('assets/model_norm.npz', X_min=X_min, X_max=X_max)

# Export to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
tflite_path = 'assets/model.tflite'
with open(tflite_path, 'wb') as f:
    f.write(tflite_model)
print(f'TFLite model saved to {tflite_path}')
print('Normalization params saved to assets/model_norm.npz')
