'use strict';

const { Router } = require('express');
const validate = require('../utils/validate');
const { errorHandler } = require('../utils/errorMiddleware');
const { idParams } = require('../validators/common.validator');
const {
  addBookSchema,
  listUserBooksSchema,
  moveBookSchema,
  setStatusSchema,
  progressSchema,
  reviewSchema,
} = require('../validators/userBook.validator');
const controller = require('../controllers/userBook.controller');

const router = Router();
const withId = (schemas = {}) => validate({ params: idParams, ...schemas });

// NB: l'autenticazione si applica quando si monta il router in app.js:
//   app.use('/api/user-books', authenticate, require('./routes/userBooks.routes'));

router.post('/', validate(addBookSchema), controller.add);
router.get('/', validate(listUserBooksSchema), controller.list);

router.get('/:id', withId(), controller.getOne);
router.delete('/:id', withId(), controller.remove);

// Spostamento tra scaffali, stato di lettura, avanzamento
router.patch('/:id/shelf', withId(moveBookSchema), controller.move);
router.patch('/:id/status', withId(setStatusSchema), controller.changeStatus);
router.patch('/:id/progress', withId(progressSchema), controller.updateProgress);

// Valutazione (1-5) e recensione
router.put('/:id/review', withId(reviewSchema), controller.saveReview);
router.delete('/:id/review', withId(), controller.removeReview);

router.use(errorHandler);

module.exports = router;
