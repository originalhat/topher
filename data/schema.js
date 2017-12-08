import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  Task,
  addTask,
  getTask,
  getTasks,
} from './database';


// provide a way for Relay to map from an object to the GraphQL type associated with that object
const {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    const {type} = fromGlobalId(globalId);
    if (type === 'Task') {
      return getTask();
    }

    return null;
  },
  (obj) => {
    if (obj instanceof Task) {
      return taskType;
    }

    return null;
  }
);

// define our Task and the available fields
const taskType = new GraphQLObjectType({
  name: 'Task',
  description: 'A task field',
  fields: () => ({
    id: globalIdField('Task'),
    text: {
      type: GraphQLString,
      resolve: (obj) => obj.text,
    }
  }),
  interfaces: [nodeInterface],
});

// root query type
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    game: {
      type: taskType,
      resolve: () => getTask(),
    },
  }),
});

// only mutation, responsible for creating new tasks
const AddTaskMutation = mutationWithClientMutationId({
  name: 'AddTask',

  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) },
  },

  outputFields: {
    taskEdge: {
      type: taskType,
      resolve: ({localTaskID}) => {
        const task = getTask(localTaskID);

        return {
          cursor: cursorForObjectInConnection(getTasks(), task),
          node: task,
        };
      },
    },
  },

  mutateAndGetPayload: ({text}) => {
    const localTodoId = addTask(text);
    return {localTodoId};
  },
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    checkHidingSpotForTreasure: AddTaskMutation,
  }),
});

export const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});
