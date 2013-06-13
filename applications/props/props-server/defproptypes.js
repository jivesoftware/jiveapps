/**
   Copyright 2013 Jive Software
 
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
**/

var rootUrl = 'http://gentle-scrubland-4425.herokuapp.com/';

exports.propTypes = [
    {
      $ItemName: 'Genius',
      title: 'Genius',
      definition: "You're a genius!",
      image_url: rootUrl + 'img/prop_types/einstein.png',
      reflection_image_url: rootUrl + 'img/prop_types/einstein.png',
      level: '0000'
    },

    {
      $ItemName: 'ThankYou',
      title: 'Thank You',
      definition: "Thanks for all that you do!",
      image_url: rootUrl + 'img/prop_types/flowers.png',
      reflection_image_url: rootUrl + 'img/prop_types/flowers.png',
      level: '0000'
    },

    {
      $ItemName: 'Beer',
      title: 'Beer',
      definition: "I owe you a beer!",
      image_url: rootUrl + 'img/prop_types/beer.png',
      reflection_image_url: rootUrl + 'img/prop_types/beer.png',
      level: '0025'
    },

    {
      $ItemName: 'CrushedIt',
      title: 'Crushed It',
      definition: "You squashed that bug dead!",
      image_url: rootUrl + 'img/prop_types/bug-crusher.png',
      reflection_image_url: rootUrl + 'img/prop_types/bug-crusher.png',
      level: '0025'
    },

    {
      $ItemName: 'NightOwl',
      title: 'Night Owl',
      definition: "You worked super late! Thanks!",
      image_url: rootUrl + 'img/prop_types/owl.png',
      reflection_image_url: rootUrl + 'img/prop_types/owl.png',
      level: '0025'
    },

    {
      $ItemName: 'TurnedItTo11',
      title: 'Turned It To 11',
      definition: "You did something amazing!",
      image_url: rootUrl + 'img/prop_types/amplifier.png',
      reflection_image_url: rootUrl + 'img/prop_types/amplifier.png',
      level: '0100'
    },

    {
      $ItemName: 'KickAss',
      title: 'Kick Ass',
      definition: "You kick ass!",
      image_url: rootUrl + 'img/prop_types/chuck-norris.png',
      reflection_image_url: rootUrl + 'img/prop_types/chuck-norris.png',
      level: '0500'
    },

    {
      $ItemName: 'HoneyBadger',
      title: 'Honey Badger',
      definition: "You're even more bad-ass than a honey-badger!",
      image_url: rootUrl + 'img/prop_types/honey-badger.png',
      reflection_image_url: rootUrl + 'img/prop_types/honey-badger.png',
      level: '1000'
    }
];
