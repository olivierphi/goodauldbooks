from app.library import models as library_models


def author_full_name(auhor: library_models.Author) -> str:
    res = []
    if auhor.first_name:
        res.append(auhor.first_name)
    if auhor.last_name:
        res.append(auhor.last_name)
    return " ".join(res)
