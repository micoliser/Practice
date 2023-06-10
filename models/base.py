#!/usr/bin/python3
""" This module contains the base model people classes """
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from uuid import uuid4


class BaseModel:
    """ The base class for creating other classes """

    id = Column(String(30),
                primary_key=True,
                nullable=False,
                unique=True)

    created_at = Column(DateTime,
                        default=datetime.utcnow(),
                        nullable=False)

    def __init__(self, **kwargs):
        """ initializes object """

        if kwargs:
            for key, value in kwargs.items():
                if key not in ["id", "created_at"]:
                    setattr(self, key, value)

        self.id = str(uuid4())
        self.created_at = datetime.utcnow()

    def to_dict(self):
        """ returns a dictionary representation of the object """

        self_dict = self.__dict__.copy()
        for key, value in self_dict.items():
            if key == "created_at":
                self_dict[key] = self.created_at.isoformat()

        if "password" in self_dict:
            del self_dict["password"]
        self_dict["__class__"] = self.__class__.__name__

        return self_dict
