from django.db import models

# Create your models here.
# model for blog post  form 
class Books(models.Model):
    id = models.AutoField(primary_key = True)
    name = models.CharField(max_length = 255)
    description = models.CharField(max_length = 255)
    remarks = models.CharField(max_length = 255)
    tags1 = models.CharField(max_length = 255)
    tags2 = models.CharField(max_length = 255)
    
    def __str__(self):
        return 'Data of ' + self.name