from django import forms
from django.http import HttpResponseRedirect
from django.shortcuts import render

class NewSearchForm(forms.Form):
    search = forms.CharField(
        label="",   # 👈 empty string removes the label
        widget=forms.TextInput(attrs={
            "placeholder": "Search Encyclopedia",
            "class": "form-control"
            })
    )

def search_form(request):
    return {
        "form" : NewSearchForm()
        }


# I don't think i need this anymore since you can still work out the logic in the view.py file knowing that searching something will redirect you to /search