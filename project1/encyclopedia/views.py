from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound
from django.http import HttpResponseRedirect
from django.urls import reverse

import markdown

from . import util

import os

import random

def search(request):
    query = request.GET.get("q")
    query = query.replace(" ", "").lower()
    if query:
        list_entries = util.list_entries()
        resulting_entries = []
        for entry in list_entries:
            cleaned_entry = entry.replace(" ", "").lower()
            if query == cleaned_entry:
                return page(request, query)
            if query in cleaned_entry:
                resulting_entries.append(entry)
    return render(request, "encyclopedia/index.html", {
        "entries": resulting_entries
    })

def newpage(request):
    title = request.POST.get("title")
    body = request.POST.get("body")
    if title and body:
        body = "#" + title + "\n\n" + body
        file_path = os.path.join('entries', f"{title}.md")
        with open(file_path, 'w') as f:
            f.write(body)
        url = reverse('page', kwargs={'title': title})
        return HttpResponseRedirect(url)
    return render(request, "encyclopedia/newpage.html")


def editpage(request):
    if request.method == "GET":    
        edit_title = request.GET.get("title")
        if not edit_title:
            body = ""
    if request.method == "POST":
        body = request.POST.get("body")
        edit_title = request.POST.get("title")
        if body and edit_title:
            file_path = os.path.join('entries', f"{edit_title}.md")
            with open(file_path, 'w') as f:
                f.write(body)
            url = reverse('page', kwargs={'title': edit_title})
            return HttpResponseRedirect(url)
    return render(request, "encyclopedia/editpage.html", {
        "entries": util.list_entries(),
        "body": util.get_entry(edit_title),
        "title": edit_title
    })

def randompage(request):
    entries = util.list_entries()
    random_num = random.randint(0,len(entries) - 1)
    title = entries[random_num]
    return page(request, title)

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def page(request, title):
    if not util.get_entry(title):
        return HttpResponseNotFound()

    return render(request, "encyclopedia/page.html", {
        "title": title.capitalize(),
        "content": markdown.markdown(util.get_entry(title)) 
    })