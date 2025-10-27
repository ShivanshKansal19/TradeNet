from django.db import models

# Create your models here.


class Stock(models.Model):
    symbol = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    series = models.CharField(max_length=100)
    date_of_listing = models.DateField()
    isin_number = models.CharField(max_length=12, primary_key=True)

    def __str__(self):
        return self.symbol


class Sector(models.Model):
    sector_name = models.CharField(max_length=100)

    def __str__(self):
        return self.sector_name
