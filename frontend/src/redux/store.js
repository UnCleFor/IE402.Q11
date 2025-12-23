import { configureStore, combineReducers } from '@reduxjs/toolkit'

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // Sử dụng localStorage làm storage mặc định

// Cấu hình redux-persist
const persistConfig = {
  key: 'root', // Key gốc cho dữ liệu lưu trữ
  version: 1,  // Phiên bản persist (dùng khi muốn migrate state sau này)
  storage,     // Dùng localStorage
  blacklist: ['product', 'user'] // Không persist các slice này (user đã dùng localStorage riêng, product không cần lưu)
}

// Gộp các reducer thành rootReducer
const rootReducer = combineReducers({
//   product: productReducer,
//   user: userReducer,
//   order: orderReducer
})

// Áp dụng persistReducer cho rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Cấu hình store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Bỏ qua kiểm tra serializable cho các action của redux-persist
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// Tạo persistor để dùng với PersistGate (giữ lại state khi reload trang)
export let persistor = persistStore(store)