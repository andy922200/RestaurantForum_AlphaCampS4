'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*外鍵名稱為大寫開頭，以避免錯誤 */
    return queryInterface.addColumn('Restaurants', 'CategoryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Categories',
        key: 'id'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Restaurant', 'CategoryId')

  }
};
