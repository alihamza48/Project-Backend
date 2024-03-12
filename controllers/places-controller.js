const uuid = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place-schema");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the biggest building",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W North East, South Carolina, America",
    creator: "u1",
  },
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Could not Retrieve any place.", 500));
  }

  if (!place) {
    return next(
      new HttpError("Couldn't find a place for the provided place ID.", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(new HttpError("No place found on this user ID", 500));
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Couldn't find a place for the provided User ID.", 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check the data", 422));
  }

  const { title, description, coordinates, address, creator } = req.body;
  let coordinate;
  try {
    coordinate = getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    image:
      "https://images.pexels.com/photos/257499/pexels-photo-257499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    address,
    location: coordinate,
    creator,
  });
  try {
    await createdPlace.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Creating place failed, Try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check the data", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Could not find the place", 500));
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    return next(new HttpError("Could not update the place", 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Could not find the place", 500));
  }

  try {
    await place.deleteOne();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Could not Delete the place", 500));
  }

  res.status(200).json({ message: "Place Deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
