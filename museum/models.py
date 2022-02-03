from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

# Create your models here.

class Artifact(models.Model):
    name = models.CharField(max_length=100)
    imagePath = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now=True, blank=True, null=True)

class Material(models.Model):    
    filePath = models.CharField(max_length=100)
    artifact = models.ForeignKey(Artifact, on_delete=models.CASCADE)

class Survey(models.Model):    
    q1 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q2 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q3 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q4 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q5 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q6 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q7 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q8 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q9 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    q10 = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
