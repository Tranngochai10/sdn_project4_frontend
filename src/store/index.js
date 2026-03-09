import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import quizzesReducer from './quizzesSlice';
import questionsReducer from './questionsSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        quizzes: quizzesReducer,
        questions: questionsReducer,
    },
});

export default store;
