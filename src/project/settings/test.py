from ._base import *

DEBUG = True

# We force the use of the same database , overriding the automatic "test_" prefix added by Django.
# This has a cost: because of that we have to flush the database every time we want to start working on tests.
# The benefit however is that it's far easier to understand what happens in our tests, as we can inspect the database.
DATABASES["default"]["TEST"] = {"NAME": env.db()["NAME"]}

# To be efficient password hashers have to be slow by design
#  - since we create tons of users during the automated tests let's speed up their password hashing
#  by purposefully opting for a weak algorithm :-)
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
