import {
  Factory,
  Model,
  RestSerializer,
  belongsTo,
  createServer,
  hasMany,
  trait
} from "miragejs";

import faker from "faker";

export default function (environment = "development") {
  return createServer({
    environment,
    models: {
      list: Model.extend({
        reminders: hasMany()
      }),
      reminder: Model.extend({
        list: belongsTo()
      })
    },

    serializers: {
      reminder: RestSerializer.extend({
        include: ["list"],
        embed: true
      })
    },

    factories: {
      list: Factory.extend({
        name() {
          return faker.animal.cat();
        },

        withReminders: trait({
          afterCreate(list, server) {
            server.createList("reminder", 2, { list });
          }
        })
      }),
      reminder: Factory.extend({
        text() {
          return faker.lorem.words();
        }
      })
    },

    seeds(server) {
      server.create("reminder");
      server.create("reminder");
      server.create("reminder");

      server.create("list", {
        name: "Home",
        reminders: [server.create("reminder", { text: faker.lorem.words() })]
      });
      server.create("list", "withReminders");
    },

    routes() {
      this.get("/api/reminders", schema => {
        return schema.reminders.all();
      });

      this.post("/api/reminders", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);

        return schema.reminders.create(attrs);
      });

      this.delete("/api/reminders/:id", (schema, request) => {
        let id = request.params.id;

        return schema.reminders.find(id).destroy();
      });

      this.get("/api/lists", (schema, request) => {
        return schema.lists.all();
      });

      this.get("/api/lists/:id/reminders", (schema, request) => {
        let listId = request.params.id;
        let list = schema.lists.find(listId);

        return list.reminders;
      });

      this.post("/api/lists", (schema, request) => {
        let attrs = JSON.parse(request.requestBody);

        return schema.lists.create(attrs);
      });

      this.delete("/api/lists/:id", (schema, request) => {
        let id = request.params.id;

        return schema.lists.find(id).destroy();
      });
    }
  });
}
