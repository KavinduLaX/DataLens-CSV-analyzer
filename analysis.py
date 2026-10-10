import pandas as pd
import numpy as np


def load_csv(file):
    return pd.read_csv(file)


def summary_stats(df):
    return df.describe().round(3).to_dict()

def missing_values(df):
    return df.isnull().sum().to_dict()

def correlation(df):
    return df.select_dtypes("number").corr().round(3).to_dict()

def column_types(df):
    return {c: str(t) for c, t in df.dtypes.items()}

def histogram(df, column, bins=10):
    counts, edges = np.histogram(df[column].dropna(), bins=bins)
    return {
        "counts": counts.tolist(),
        "edges": [round(float(e), 2) for e in edges]
    }