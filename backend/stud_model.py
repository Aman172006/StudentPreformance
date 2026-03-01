import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split  # for splitting the data into training and testing sets
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder

import joblib

df = pd.read_csv("student_data.csv", sep=",")

df.to_csv("student_data.csv", index=False)
X = df.drop("G3", axis=1) #G3 is the target variable, so we drop it from the features.
y = df["G3"] #target variable

X = pd.get_dummies(X, drop_first=True) #pd.get_dummies() converts categories into numeric binary features. Ye Male ko M ke jagah 1 aur female ko F ke jagah 0 kr deta hai. drop_first=True se first category ko drop kr deta hai taki multicollinearity na ho.

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42) # test_size=0.2 means 20% of the data will be used for testing and 80% for training. random_state=42 ensures that the split is reproducible.

model = LinearRegression() #Selectig model
model.fit(X_train, y_train) #fitting and training

joblib.dump(model, "student_performance_model.pkl") #Saving the model
joblib.dump(X.columns.tolist(), "model_columns.pkl")

y_pred = model.predict(X_test)
y_pred = np.clip(y_pred, 0, 20) #Forces the predicted values to be between 0 and 20, which are the valid grade ranges for G3.

mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("Mean Squared Error:", mse)
print("R^2 Score:", r2)