const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

const createTask = async (name, due_date = null) => {
  const response = await request(app)
    .post('/api/items')
    .send({ name, due_date })
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

describe('TODO API — Integration', () => {
  describe('Full task lifecycle', () => {
    it('creates, edits, completes, and deletes a task', async () => {
      // Create
      const created = await createTask('Integration lifecycle task', '2026-06-01');
      expect(created.name).toBe('Integration lifecycle task');
      expect(created.due_date).toBe('2026-06-01');
      expect(created.completed).toBe(0);

      // Edit name and due date
      const edited = await request(app)
        .put(`/api/items/${created.id}`)
        .send({ name: 'Updated lifecycle task', due_date: '2026-07-01' });
      expect(edited.status).toBe(200);
      expect(edited.body.name).toBe('Updated lifecycle task');
      expect(edited.body.due_date).toBe('2026-07-01');

      // Mark complete
      const completed = await request(app).patch(`/api/items/${created.id}/complete`);
      expect(completed.status).toBe(200);
      expect(completed.body.completed).toBe(1);

      // Verify it appears at the bottom of the sorted list
      const list = await request(app).get('/api/items');
      expect(list.status).toBe(200);
      const last = list.body[list.body.length - 1];
      expect(last.id).toBe(created.id);

      // Delete
      const deleted = await request(app).delete(`/api/items/${created.id}`);
      expect(deleted.status).toBe(200);
      expect(deleted.body).toEqual({ message: 'Item deleted successfully', id: created.id });

      // Confirm gone
      const missing = await request(app).delete(`/api/items/${created.id}`);
      expect(missing.status).toBe(404);
    });
  });

  describe('Sort order', () => {
    it('returns incomplete tasks before completed tasks', async () => {
      const inc = await createTask('Sort — incomplete');
      const comp = await createTask('Sort — complete');
      await request(app).patch(`/api/items/${comp.id}/complete`);

      const list = await request(app).get('/api/items');
      const ids = list.body.map((t) => t.id);
      expect(ids.indexOf(inc.id)).toBeLessThan(ids.indexOf(comp.id));
    });

    it('returns tasks with earlier due dates before later ones', async () => {
      const later = await createTask('Sort — later due date', '2027-12-31');
      const earlier = await createTask('Sort — earlier due date', '2026-04-01');

      const list = await request(app).get('/api/items');
      const ids = list.body.map((t) => t.id);
      expect(ids.indexOf(earlier.id)).toBeLessThan(ids.indexOf(later.id));
    });

    it('returns tasks without a due date after tasks with a due date', async () => {
      const withDate = await createTask('Sort — has due date', '2026-05-01');
      const noDate = await createTask('Sort — no due date');

      const list = await request(app).get('/api/items');
      const incompleteTasks = list.body.filter((t) => t.completed === 0);
      const ids = incompleteTasks.map((t) => t.id);
      expect(ids.indexOf(withDate.id)).toBeLessThan(ids.indexOf(noDate.id));
    });
  });

  describe('Input validation', () => {
    it('rejects creating a task with no name', async () => {
      const res = await request(app).post('/api/items').send({ due_date: '2026-04-01' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Item name is required');
    });

    it('rejects creating a task with an invalid due date', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ name: 'Bad date', due_date: 'tomorrow' });
      expect(res.status).toBe(400);
    });

    it('rejects updating a task with a blank name', async () => {
      const task = await createTask('Validation test task');
      const res = await request(app).put(`/api/items/${task.id}`).send({ name: '   ' });
      expect(res.status).toBe(400);
    });

    it('rejects updating a non-existent task', async () => {
      const res = await request(app).put('/api/items/999999').send({ name: 'Ghost' });
      expect(res.status).toBe(404);
    });

    it('rejects completing a non-existent task', async () => {
      const res = await request(app).patch('/api/items/999999/complete');
      expect(res.status).toBe(404);
    });

    it('rejects deleting a non-existent task', async () => {
      const res = await request(app).delete('/api/items/999999');
      expect(res.status).toBe(404);
    });
  });
});
