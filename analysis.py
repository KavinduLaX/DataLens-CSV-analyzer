import pandas as pd
import numpy as np


def _clean(d):
    """Replace NaN with None so Flask returns valid JSON."""
    return {
        k: _clean(v) if isinstance(v, dict) else (None if pd.isna(v) else v)
        for k, v in d.items()
    }


def load_csv(file):
    return pd.read_csv(file)


def summary_stats(df):
    return _clean(df.describe().round(3).to_dict())


def missing_values(df):
    return df.isnull().sum().to_dict()


def correlation(df):
    return _clean(df.select_dtypes("number").corr().round(3).to_dict())


def column_types(df):
    return {c: str(t) for c, t in df.dtypes.items()}


def histogram(df, column, bins=10):
    counts, edges = np.histogram(df[column].dropna(), bins=bins)
    return {
        "counts": counts.tolist(),
        "edges": [round(float(e), 2) for e in edges],
    }

def text_report(df):
    types = pd.DataFrame({
        "type": df.dtypes.astype(str),
        "missing": df.isnull().sum(),
    })
    line = "=" * 70
    parts = [
        line,
        "DATALENS REPORT",
        line,
        f"Rows: {len(df)}    Columns: {len(df.columns)}",
        "",
        "COLUMN TYPES AND MISSING VALUES",
        "-" * 70,
        types.to_string(),
        "",
        "SUMMARY STATISTICS",
        "-" * 70,
        df.describe().round(3).to_string(),
        "",
        "CORRELATION MATRIX",
        "-" * 70,
        df.select_dtypes("number").corr().round(3).to_string(),
        "",
    ]
    return "\n".join(parts)