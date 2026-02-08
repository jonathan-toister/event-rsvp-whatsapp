const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

/**
 * Event Routes
 * Base path: /api/v1/events
 */

// Create a new event
router.post('/', (req, res) => eventController.createEvent(req, res));

// Get all events
router.get('/', (req, res) => eventController.getAllEvents(req, res));

// Get event by ID
router.get('/:id', (req, res) => eventController.getEvent(req, res));

// Update event
router.put('/:id', (req, res) => eventController.updateEvent(req, res));

// Delete event
router.delete('/:id', (req, res) => eventController.deleteEvent(req, res));

// Send event invitations
router.post('/:id/send', (req, res) => eventController.sendInvitations(req, res));

// Get RSVPs for an event
router.get('/:id/rsvps', (req, res) => eventController.getEventRSVPs(req, res));

module.exports = router;
