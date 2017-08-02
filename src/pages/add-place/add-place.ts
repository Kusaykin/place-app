import { Component } from '@angular/core';
import {LoadingController, ModalController, ToastController} from 'ionic-angular';
import {NgForm} from "@angular/forms";
import {SetLocationPage} from "../set-location/set-location";
import {Location} from "../../models/location";
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {PlacesService} from "../../services/places";
import {File, FileError} from '@ionic-native/file';



declare var cordova: any;

@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {
  locationIsSet = false;
  location: Location = {
    lat: 43.241443,
    lng: 76.945151
  };
  imageUrl = '';


  constructor(private modalCtrl: ModalController,
              private geolocation: Geolocation,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private camera: Camera,
              private placesService: PlacesService,
              private file: File) {}


  onSubmit(form: NgForm){
    this.placesService.addPlace(form.value.title,
      form.value.description,
      this.location,
      this.imageUrl);
    form.reset();
    this.location = {
      lat: 43.241443,
      lng: 76.945151
    };
    this.imageUrl = '';
    this.locationIsSet =false;
  }

  onOpenMap() {
    const modal = this.modalCtrl.create(SetLocationPage, {location: this.location, isSet: this.locationIsSet});
    modal.present();
    modal.onDidDismiss(
      data => {
        if (data) {
          this.location = data.location;
          this.locationIsSet = true;
        }
      });
  }

  onLocation(){
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location...'
    });
    this.geolocation.getCurrentPosition()
      .then(
        location => {
          loader.dismiss();
          this.location.lat = location.coords.latitude;
          this.location.lng = location.coords.longitude;
          this.locationIsSet = true;
        }
      )
      .catch(error => {
        loader.dismiss();
        const toast = this.toastCtrl.create({
          message: 'Could get location. please pick it manually!',
          duration: 2500
        });
        toast.present();
      });
  }

  onTakePhoto(){
    const options: CameraOptions = {
      //quality: 100,
     // destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      //mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options)
      .then(
        imageData => {
          const currentName = imageData.replace(/^.*[\\\/]/, '');
          const path = imageData.replace(/[^\/]*$/,'');
          this.file.moveFile(path, currentName, cordova.file.dataDirectory, currentName)
            .then(
              data => {
                this.imageUrl = data.nativeURL;
                this.camera.cleanup();
                //this.file.removeFile(path, currentName);
              }
            )
            .catch(
              err => {
                this.imageUrl = '';
                const toast = this.toastCtrl.create({
                  message: 'Could not save the image. Please try again',
                  duration: 2500
                });
                toast.present();
                this.camera.cleanup();
              }
            );
          this.imageUrl = imageData;
        }
      )
      .catch(
        (error: FileError) => {
          const toast = this.toastCtrl.create({
            message: 'Could not take the image. Please try again',
            duration: 2500
          });
          toast.present();
          this.camera.cleanup();
        }
      );
  }

}
