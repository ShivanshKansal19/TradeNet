"""Prediction models."""
from .baseline import NaiveBaselineModel
from .ensemble import QuantileEnsembleForecastModel

__all__ = ["NaiveBaselineModel", "QuantileEnsembleForecastModel"]
