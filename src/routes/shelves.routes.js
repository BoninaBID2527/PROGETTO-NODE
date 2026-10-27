'use strict';

const { Router } = require('express');
const validate = require('../utils/validate');
const { errorHandler } = require('../utils/errorMiddleware');
const { idParams } = require('../validators/common.validator');
const {
  createShelfSchema,
  updateShelfSchema,
  deleteShelfSchema,
  listShelfBooksSchema,
} = require('../validators/shelf.validator');
const controller = require('../controllers/shelf.controller');

const router = Router();

// NB: l'autenticazione si applica quando si monta il router in app.js:
//   app.use('/api/shelves', authenticate, require('./routes/shelves.routes'));

router.get('/', controller.list);
router.post('/', validate(createShelfSchema), controller.create);

router.get('/:id', validate({ params: idParams, ...listShelfBooksSchema }), controller.getOne);
router.patch('/:id', validate({ params: idParams, ...updateShelfSchema }), controller.update);
router.delete('/:id', validate({ params: idParams, ...deleteShelfSchema }), controller.remove);

router.use(errorHandler);

module.exports = router;
