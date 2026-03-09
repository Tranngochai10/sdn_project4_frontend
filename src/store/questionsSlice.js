import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questionAPI } from '../api/api';

export const fetchQuestions = createAsyncThunk('questions/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const res = await questionAPI.getAll();
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch questions');
    }
});

export const createQuestion = createAsyncThunk('questions/create', async (data, { rejectWithValue }) => {
    try {
        const res = await questionAPI.create(data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create question');
    }
});

export const updateQuestion = createAsyncThunk('questions/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await questionAPI.update(id, data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update question');
    }
});

export const deleteQuestion = createAsyncThunk('questions/delete', async (id, { rejectWithValue }) => {
    try {
        await questionAPI.delete(id);
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete question');
    }
});

const questionsSlice = createSlice({
    name: 'questions',
    initialState: {
        questions: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError(state) { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuestions.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchQuestions.fulfilled, (state, action) => { state.loading = false; state.questions = action.payload; })
            .addCase(fetchQuestions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(createQuestion.fulfilled, (state, action) => { state.questions.push(action.payload); })
            .addCase(createQuestion.rejected, (state, action) => { state.error = action.payload; })

            .addCase(updateQuestion.fulfilled, (state, action) => {
                const idx = state.questions.findIndex(q => q._id === action.payload._id);
                if (idx !== -1) state.questions[idx] = action.payload;
            })
            .addCase(updateQuestion.rejected, (state, action) => { state.error = action.payload; })

            .addCase(deleteQuestion.fulfilled, (state, action) => {
                state.questions = state.questions.filter(q => q._id !== action.payload);
            })
            .addCase(deleteQuestion.rejected, (state, action) => { state.error = action.payload; });
    },
});

export const { clearError } = questionsSlice.actions;
export default questionsSlice.reducer;
