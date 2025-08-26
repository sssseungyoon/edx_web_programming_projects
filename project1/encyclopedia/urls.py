from django.urls import path

from . import views



urlpatterns = [
    path("", views.index, name="index"),
    path("newpage", views.newpage, name="new_page"),
    path("editpage", views.editpage, name="edit_page"),
    path("randompage", views.randompage, name="random_page"),
    path("wiki/<str:title>", views.page, name="page"),
    path("search", views.search, name="search")
]
