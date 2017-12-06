const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

  menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM menuItem WHERE menuItem.menu_id = $menuId';
    const values = { $menuId: req.params.menuId};
    db.all(sql, values, (error, menuItems) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({menuItems: menuItems});
      }
    });
  });
  
  //creates new menuItem
  menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name,
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price;
    menuId = req.params.menuId;
    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = {$menuId: menuId};
    //check if employee id exists before retrieving employee timecard
    db.get(menuSql, menuValues, (error, employee) => {
      if (error) {
        next(error);
      } else {
        if (!name || !description || !inventory || !price) {
          return res.sendStatus(400);
        }
  
        const sql = 'INSERT INTO menuItem (name, description, inventory, price, menu_id)' +
            'VALUES ($name, $rate, $inventory, $price, $menuId)';
        const values = {
          $name: name,
          $description: description,
          $inventory: inventory,
          $price: price,
          $menuId: menuId
        };
  
        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`SELECT * FROM menuItem WHERE menuItem.menu_id = ${this.lastID}`,
              (error, menuItem) => {
                res.status(200).json({menuItem: menuItem});
              });
          }
        });
      }
    });
  });
  

  
  menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name,
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price;
    menuId = req.params.menuId;
  
    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = {$menuId: menuId};
    //first check if employee exists
    db.get(menuSql, menuValues, (error, employee) => {
      if (error) {
        next(error);
      } else {
        if (!name || !description || !inventory || !price) {
          return res.sendStatus(400);
        }
  
        const sql = 'UPDATE menuItem SET name = $name, description = $description, ' +
            'inventory = $inventory, price = $price ' +
            'WHERE menuItem.menu_id = $menuId';
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId
        };
  
        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`SELECT * FROM menuItem WHERE menuItem.menu_id = ${req.params.menuItemId}`,
              (error, menuItem) => {
                res.status(200).json({menuItem: menuItem});
              });
          }
        });
      }
    });
  });
  
  menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM menuItem WHERE menuItem.id = $menuItemId';
    const values = {$menuItemId: req.params.menuItemId};
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
  });
  





























module.exports = menuItemsRouter;
