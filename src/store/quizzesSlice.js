import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quizAPI } from '../api/api';

export const fetchQuizzes = createAsyncThunk('quizzes/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const res = await quizAPI.getAll();
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch quizzes');
    }
});

export const fetchQuiz = createAsyncThunk('quizzes/fetchOne', async (id, { rejectWithValue }) => {
    try {
        const res = await quizAPI.getById(id);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch quiz');
    }
});

export const createQuiz = createAsyncThunk('quizzes/create', async (data, { rejectWithValue }) => {
    try {
        const res = await quizAPI.create(data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create quiz');
    }
});

export const updateQuiz = createAsyncThunk('quizzes/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await quizAPI.update(id, data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update quiz');
    }
});

export const deleteQuiz = createAsyncThunk('quizzes/delete', async (id, { rejectWithValue }) => {
    try {
        await quizAPI.delete(id);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete quiz');
    }
});

export const addQuestionToQuiz = createAsyncThunk('quizzes/addQuestion', async ({ quizId, data }, { rejectWithValue }) => {
    try {
        const res = await quizAPI.addQuestion(quizId, data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to add question');
    }
});

const quizzesSlice = createSlice({
    name: 'quizzes',
    initialState: {
        quizzes: [],
        currentQuiz: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentQuiz(state) { state.currentQuiz = null; },
        clearError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuizzes.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchQuizzes.fulfilled, (state, action) => { state.loading = false; state.quizzes = action.payload; })
            .addCase(fetchQuizzes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchQuiz.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchQuiz.fulfilled, (state, action) => { state.loading = false; state.currentQuiz = action.payload; })
            .addCase(fetchQuiz.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(createQuiz.fulfilled, (state, action) => { state.quizzes.push(action.payload); })
            .addCase(createQuiz.rejected, (state, action) => { state.error = action.payload; })

            .addCase(updateQuiz.fulfilled, (state, action) => {
                const idx = state.quizzes.findIndex(q => q._id === action.payload._id);
                if (idx !== -1) state.quizzes[idx] = action.payload;
            })
            .addCase(updateQuiz.rejected, (state, action) => { state.error = action.payload; })

            .addCase(deleteQuiz.fulfilled, (state, action) => {
                state.quizzes = state.quizzes.filter(q => q._id !== action.payload);
            })
            .addCase(deleteQuiz.rejected, (state, action) => { state.error = action.payload; });
    },
});

export const { clearCurrentQuiz, clearError } = quizzesSlice.actions;
export default quizzesSlice.reducer;
