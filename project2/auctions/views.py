from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from django.contrib import messages


from .models import User, Auction_Item, Bids


def index(request):
    return render(request, "auctions/index.html", {
        "items": Auction_Item.objects.all()
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

def item(request, item_id):
    if request.method == "GET":
        return render(request, 'auctions/item.html', {
            'item': Auction_Item.objects.get(pk =item_id)
        })
    elif request.method == "POST":
        item = Auction_Item.objects.get(pk=item_id)
        price = item.price
        bid_price =  int(request.POST["bid_price"])
        if request.user.is_authenticated:
            if bid_price <= price:
                messages.error(request,"The bid price has to be higher than the current bid price.")
                return HttpResponseRedirect(reverse('item', args=(item_id,)))
            else:
                item.price = bid_price
                item.save()
                new_bid = Bids(price = price, item = item, user = request.user)
                new_bid.save()
                return HttpResponseRedirect(reverse('item', args=(item_id,)))
        else: 
            messages.error(request,"You have to log-in to make a bid.")
            return HttpResponseRedirect(reverse('item', args=(item_id,)))

