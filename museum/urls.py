from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('view-ar/<int:id>', views.view_ar, name='view_ar'),
    path('handle_new_survey_data', views.handle_new_survey_data, name='handle_new_survey_data'),
]

urlpatterns = urlpatterns + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
