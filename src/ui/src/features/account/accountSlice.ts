import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit"
import { User } from "../../app/models/user";
import agent from "../../app/api/agent";
import { FieldValues } from "react-hook-form";
import { router } from "../../app/router/Route";
import { toast } from "react-toastify";
import { setBasket } from "../basket/basketSlice";

interface AccountState {
    user: User | null
}

const initialState: AccountState = {
    user: null
}

export const signInUserAsync = createAsyncThunk<User, FieldValues>(
    'account/signInUserAsync',
    async (data, thunkAPI) => {
        try {
            const userDto = await agent.Account.login(data);
            const {basket, ...user} = userDto;
            if(basket) thunkAPI.dispatch(setBasket(basket));
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error : any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    } 
);

export const fetchCurrentUserAsync = createAsyncThunk<User>(
    'account/fetchCurrentUserAsync',
    async (_, thunkAPI) => {
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)));
        try {
            const userDto = await agent.Account.currentUser();
            const {basket, ...user} = userDto;
            if(basket) thunkAPI.dispatch(setBasket(basket));
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error : any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    },
    {
        condition: () => {
            if(!localStorage.getItem('user')) return false;
        }
    }
);

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers : {
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            router.navigate('/')
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchCurrentUserAsync.rejected, (state) => {
            state.user = null;
            localStorage.removeItem('user');
            toast.error('Session expired. Please login again.');
            router.navigate('/');
        });
        builder.addMatcher(isAnyOf(signInUserAsync.fulfilled, fetchCurrentUserAsync.fulfilled), (state, action) => {
            state.user = action.payload;
        });
        builder.addMatcher(isAnyOf(signInUserAsync.rejected, fetchCurrentUserAsync.rejected), (state, action) => {
            throw action.payload;
        });
    })
})

export const {signOut, setUser} = accountSlice.actions;