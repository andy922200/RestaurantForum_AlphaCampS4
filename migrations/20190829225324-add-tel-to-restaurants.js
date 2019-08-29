'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Restaurants', 'tel', {
      type: Sequelize.STRING
    })

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Restaurants', 'tel', {
      type: Sequelize.STRING
    })

  }
};
