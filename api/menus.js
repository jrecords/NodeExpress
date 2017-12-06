const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items.js');

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: menuId};
    db.get(sql, values, (error, menu) => {
      if (error) {
        next(error);
      } else if (menu) {
        req.menu = menu;
        next();
      } else {
        res.sendStatus(404);
      }
    });
  });
  

  //get all menus
  menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu',
      (err, menus) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({menus: menus});
        }
      });
  });


  //get one menu by id
  menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
  });
  
//add menu
  menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Menu (title)' +
        'VALUES ($title)';
    const values = {
      $title: title
    };
    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
          (error, menu) => {
            res.status(201).json({menu: menu});
          });
      }
    });
  });

 //edit an menu by id
  menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
    }
  
    const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const values = {
        $title: title,
        $menuId: req.params.menuId
    };
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
          (error, menu) => {
            res.status(200).json({menu: menu});
          });
      }
    });
  });
  
  //deletes an menu by id
  menusRouter.delete('/:menuId', (req, res, next) => {
        hasMenuItem = false;
        const sqlCheck = 'SELECT * from MenuItem where MenuItem.menu_id = $menuId';
        const valuesCheck = {
            $menuId:req.params.menuId
        };

        db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`,
            (error, menuItem) => {
                if(menuItem){
                    hasMenuItem = true;
                    res.status(400).send();
                }else{
                    const sql = 'DELETE from Menu WHERE Menu.id = $menuId';
                    const values = {
                    $menuId: req.params.menuId
                    };
                    db.run(sql, values, (error) => {
                        if (error) {
                            next(error);
                        } else {
                            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
                            (error, menu) => {
                                res.status(204).json({menu: menu});
                            });
                        }
                    });//end db.run
                }
            });//end db.get
  });
module.exports = menusRouter;