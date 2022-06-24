from django.shortcuts import render, HttpResponse, redirect
from home.models import Books

# Create your views here.
def home(request):
    return render(request, 'home/index.html')

def apitry(request):
    allData = Books.objects.all()
    context = {'allData': allData}
    return render(request, 'home/apitry.html', context)