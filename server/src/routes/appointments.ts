import { Router } from 'express';
import { createAppointment, getMyAppointments, updateAppointment } from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createAppointment);
router.get('/my', authenticate, getMyAppointments);
router.put('/:id', authenticate, updateAppointment);

export default router;
