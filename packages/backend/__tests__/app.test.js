const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

const createItem = async (name = 'Temp Item to Delete', due_date = null) => {
  const response = await request(app)
    .post('/api/items')
    .send({ name, due_date })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('due_date');
      expect(item).toHaveProperty('completed');
      expect(item).toHaveProperty('created_at');
    });

    it('should return completed tasks after incomplete tasks', async () => {
      const incomplete = await createItem('Incomplete Task');
      const complete = await createItem('Complete Task');
      await request(app).patch(`/api/items/${complete.id}/complete`);

      const response = await request(app).get('/api/items');
      expect(response.status).toBe(200);

      const ids = response.body.map((i) => i.id);
      expect(ids.indexOf(incomplete.id)).toBeLessThan(ids.indexOf(complete.id));
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item without a due date', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test Item' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Item');
      expect(response.body.due_date).toBeNull();
      expect(response.body.completed).toBe(0);
    });

    it('should create a new item with a valid due date', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Task with due date', due_date: '2026-04-01' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.due_date).toBe('2026-04-01');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if due_date is invalid', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Bad date task', due_date: 'not-a-date' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update the name of an existing item', async () => {
      const item = await createItem('Original Name');
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    it('should update the due date of an existing item', async () => {
      const item = await createItem('Task to update date');
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ due_date: '2026-05-10' });

      expect(response.status).toBe(200);
      expect(response.body.due_date).toBe('2026-05-10');
    });

    it('should clear the due date when null is sent', async () => {
      const item = await createItem('Task with date', '2026-04-01');
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ due_date: null });

      expect(response.status).toBe(200);
      expect(response.body.due_date).toBeNull();
    });

    it('should return 400 if name is empty string', async () => {
      const item = await createItem('Task to fail edit');
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ name: 'Ghost' });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/items/:id/complete', () => {
    it('should mark an incomplete task as complete', async () => {
      const item = await createItem('Task to complete');
      expect(item.completed).toBe(0);

      const response = await request(app).patch(`/api/items/${item.id}/complete`);
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    it('should toggle a completed task back to incomplete', async () => {
      const item = await createItem('Task to toggle');
      await request(app).patch(`/api/items/${item.id}/complete`);

      const response = await request(app).patch(`/api/items/${item.id}/complete`);
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(0);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).patch('/api/items/999999/complete');
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });
});