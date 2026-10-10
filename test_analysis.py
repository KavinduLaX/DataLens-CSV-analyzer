import pandas as pd
from analysis import summary_stats, missing_values, correlation, column_types, histogram


def sample():
    return pd.DataFrame({"a": [1, 2, 3, None], "b": [2, 4, 6, 8]})


def test_missing():
    assert missing_values(sample())["a"] == 1


def test_corr():
    assert correlation(sample())["b"]["b"] == 1.0


def test_types():
    assert "a" in column_types(sample())


def test_summary():
    assert summary_stats(sample())["b"]["mean"] == 5.0


def test_hist():
    assert sum(histogram(sample(), "b")["counts"]) == 4