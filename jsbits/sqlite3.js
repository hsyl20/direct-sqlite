//#OPTIONS:CPP
//#OPTIONS:EMCC:EXPORTED_RUNTIME_METHODS=getValue,ccall,cwrap,getTempRet0,addFunction,removeFunction,getEmptyTableSlot
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_malloc,_free
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_open,_sqlite3_close,_sqlite3_errcode
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_open_v2,_sqlite3_extended_errcode
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_errmsg,_sqlite3_interrupt,_sqlite3_trace
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_get_autocommit,_sqlite3_enable_shared_cache
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_exec,_sqlite3_prepare_v2,_sqlite3_db_handle
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_step,_sqlite3_reset,_sqlite3_finalize
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_clear_bindings,_sqlite3_sql
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_bind_parameter_count,_sqlite3_bind_parameter_name
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_bind_parameter_index,_sqlite3_column_count
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_column_name,_sqlite3_bind_blob
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_bind_zeroblob,_sqlite3_bind_text
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_bind_double,_sqlite3_bind_int64
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_bind_null,_sqlite3_column_type
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_column_bytes,_sqlite3_column_blob
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_column_text,_sqlite3_column_int64
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_column_double,_sqlite3_last_insert_rowid
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_changes,_sqlite3_total_changes
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_create_function_v2,_sqlite3_user_data
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_context_db_handle,_sqlite3_aggregate_context
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_value_type,_sqlite3_value_bytes
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_value_blob,_sqlite3_value_text
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_value_int64,_sqlite3_value_double
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_result_null,_sqlite3_result_blob
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_result_zeroblob,_sqlite3_result_text
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_result_int64,_sqlite3_result_double
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_result_value,_sqlite3_result_error
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_create_collation_v2,_sqlite3_free
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_enable_load_extension,_sqlite3_wal_hook
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_blob_open,_sqlite3_blob_close
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_blob_reopen,_sqlite3_blob_bytes
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_blob_read,_sqlite3_blob_write
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_backup_init,_sqlite3_backup_finish
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_backup_step,_sqlite3_backup_remaining
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_backup_pagecount
//#OPTIONS:EMCC:EXPORTED_FUNCTIONS=_sqlite3_extended_result_codes


// sqlite3_open ::  CString -> Ptr (Ptr CDatabase) -> IO CError
function h$sqlite3_open(str_d, str_o, db_d, db_o) {
  var str = h$initHeapBuffer(str_d, str_o);
  var ptr = h$initHeapBufferLen(db_d, db_o, 4);
  var ret = _sqlite3_open(str, ptr);

  h$putHeapAddr(db_d, db_o, h$derefHeapPtr_addr(ptr));

  _free(ptr);
  _free(str);

  return ret;
}

// sqlite3_open_v2 ::  CString -> Ptr (Ptr CDatabase) -> CInt -> CString -> IO CError
function h$sqlite3_open_v2(str_d, str_o, db_d, db_o, flags, vfs_d, vfs_o) {
  var str = h$initHeapBuffer(str_d, str_o);
  var vfs = h$initHeapBuffer(vfs_d, vfs_o);
  var ptr = h$initHeapBufferLen(db_d, db_o, 4);
  var ret = _sqlite3_open_v2(str, ptr, flags, vfs);

  h$putHeapAddr(db_d,db_o, h$derefHeapPtr_addr(ptr));

  _free(ptr);
  _free(vfs);
  _free(str);

  return ret;
}

// sqlite3_close :: Ptr CDatabase -> IO CError
function h$sqlite3_close(db_d, db_o) {
  return _sqlite3_close(db_o);
}

// sqlite3_errcode :: Ptr CDatabase -> IO CError
function h$sqlite3_errcode(db_d, db_o) {
  return _sqlite3_errcode(db_o);
}

// sqlite3_extended_errcode :: Ptr CDatabase -> IO CError
function h$sqlite3_extended_errcode(db_d, db_o) {
  return _sqlite3_extended_errcode(db_o);
}

// sqlite3_interrupt :: Ptr CDatabase -> IO ()
function h$sqlite3_interrupt(db_d, db_o) {
  // we don't really need to return here. it's unit.
  return _sqlite3_interrupt(db_o);
}

// sqlite3_errmsg :: Ptr CDatabase -> IO CString
function h$sqlite3_errmsg(db_d, db_o) {
  var off = _sqlite3_errmsg(db_o);
  RETURN_UBX_TUP2(h$HEAP, off);
}

// sqlite3_trace :: Ptr CDatabase -> FunPtr (CTraceCallback a)  -> Ptr a -> IO (Ptr ())
//
// type CTraceCallback a
//    = Ptr a    -- context passing
//    -> CString -- UTF-8 rendering of the SQL statement before its execution
//    -> IO ()
function h$sqlite3_trace(db_d, db_o, cb_ptr_d, cb_ptr_o, ctx_d, ctx_o) {

  var cb_ptr = h$registerFunPtrOnHeap(cb_ptr_d, cb_ptr_o, false, 'vii', (cb) => {
    return function(_ctx_ptr, str) {
      var str_ = h$copyCStringFromHeap(str);
      // we directly capture the context parameter in this JS closure, so we
      // can ignore the _ctx_ptr argument (which we set to null below)
      cb({'array':ctx_d,'offset':ctx_o}, str_);
      return;
    };
  });
  var ret = _sqlite3_trace(db_o, cb_ptr, null);

  // Do not call removeFunction(cb_ptr)! It keeps the callback alive on
  // the Emscripten heap. Currently we have no way to free it. But it isn't an
  // issue as it's only for unsafe tracing (see comments in Haskell code).

  RETURN_ADDR(h$HEAP, ret);
}

// sqlite3_get_autocommit :: Ptr CDatabase -> IO CInt
function h$sqlite3_get_autocommit(db_d, db_o) {
  return _sqlite3_get_autocommit(db_o);
}

// sqlite3_exec :: Ptr CDatabase            -- open database
//              -> CString                  -- SQL to be evaluated
//              -> FunPtr (CExecCallback a) -- callback function
//              -> Ptr a                    -- 1st argument to callback
//              -> Ptr CString              -- error msg written here
//              -> IO CError
function h$sqlite3_exec(db_d, db_o,
                        sql_d, sql_o,
                        stbl_buf, stbl_ptr,
                        ptr_d, ptr_o,
                        res_d, res_o) {

                        //   type CExecCallback a
                        //   = Ptr a
                        //  -> CColumnCount -- ^ Number of columns, which is the number of elements in
                        //                  --   the following arrays.
                        //  -> Ptr CString  -- ^ Array of column values, as returned by
                        //                  --   'c_sqlite3_column_text'.  Null values are represented
                        //                  --   as null pointers.
                        //  -> Ptr CString  -- ^ Array of column names
                        //  -> IO CInt      -- ^ If the callback returns non-zero, then
                        //                  --   'c_sqlite3_exec' returns @SQLITE_ABORT@
                        //                  --   ('ErrorAbort').

  var cb = null;
      cb_ptr = null;
  if(stbl_ptr !== 0) {
      cb = h$deRefStablePtr(stbl_ptr);
      cb_ = function(ctx_ptr, col_count, cval_ptr, ccol_ptr) {
        // we don't need ctx_ptr because we directly capture ptr_d/ptr_o in
        // our JS callback closure.

        // So the function *C* callback will be passed something like this:
        //        HEAPU8
        //      .--------.
        //      |  ctx* -|-> [context_sized byte array]
        //      |  n     |
        //    .-|- val*  |
        //  .-|-|  col*  |
        //  | | /--------/
        //  | '>| val[0]-|-> CString
        //  |   | val[1]-|-> CString
        //  |   / ...    /
        //  |   | val[n]-|-> CString
        //  |   /--------/
        //  '-->| col[0]-|-> CString
        //      | col[1]-|-> CString
        //      / ...    /
        //      | col[n]-|-> CString
        //      '--------'
        var cval_ptr_ = h$copyPtrArrayFromHeap(cval_ptr, col_count);
            ccol_ptr_ = h$copyPtrArrayFromHeap(ccol_ptr, col_count);

        // FIXME: to avoid the copy, we could simply update the "arr" array of
        // h$HEAP to indicate that these pointers are in h$HEAP too.
        // We should remove this indication after the callback because "arr"
        // may never be erased afterwards.
        //
        // Currently we do a copy in the JS heap instead.

        // We copied the pointers but they're still pointing in HEAP! Now we
        // copy the pointed values and update the pointers accordingly.
        for(var i = 0; i < col_count; i++) {
          var ptr = cval_ptr_.i3[i];
          var str = h$copyCStringFromHeap(ptr);
          PUT_ADDR(cval_ptr_,i*4,str,0);
        }
        for(var i = 0; i < col_count; i++) {
          var ptr = ccol_ptr_.i3[i];
          var str = h$copyCStringFromHeap(ptr);
          PUT_ADDR(ccol_ptr_,i*4, str,0);
        }
        // these arguments will be passed to rts_mkPtr and similar if the target
        // callback has been created as a foreign import "wrapper".
        //
        // Hence we can pass arguments such as an (array,offset) tuple because
        // the JS implementation of rts_mkPtr accepts them. But if
        // the FunPtr was obtained with a reference pointer (foreign import
        // "&foo" :: FunPtr ...) then the target JS function must call
        // rts_mkPtr etc. to work properly.
        var res = cb({'offset': ptr_o, 'array': ptr_d}, col_count, cval_ptr_, ccol_ptr_);

        // FIXME: Free temporary strings!
        return res;
      };
      cb_ptr = Module.addFunction(cb_,'iiiii');
  }
  return h$withCStringOnHeap(sql_d, sql_o, function(sql) {
    var ptr_ptr = ptr_d === null ? null : h$initHeapBufferLen(ptr_d, ptr_o, 4);
    var ret = h$withOutBufferOnHeap(res_d, res_o, 4, function(res_ptr) {
          return _sqlite3_exec(db_o, sql, cb_ptr, null, res_ptr);
        });
    // I don't think we need to read back anything from a FunPtr value. Just pass it.
    PUT_ADDR(res_d,0,h$copyCStringFromHeap(res_d.i3[0]),0);
    if(ptr_d !== null) {
      PUT_ADDR(ptr_d,0,h$copyCStringFromHeap(ptr_ptr),0);
    }
    if(cb_ptr !== null) {
      Module.removeFunction(cb_ptr);
    }
    return ret;
  });
}

// sqlite3_prepare_v2 :: Ptr CDatabase -> CString -> CNumBytes -> Ptr (Ptr CStatement) -> Ptr CString -> IO CError
function h$sqlite3_prepare_v2(db_d, db_o, sql_d, sql_o, bytes, hdl_d, hdl_o, res_d, res_o) {
  return h$withCStringOnHeap(sql_d, sql_o, function(sql) {
    var hdl_ptr = h$initHeapBufferLen(hdl_d, hdl_o, 4);
        res_ptr = res_d === null ? null : h$initHeapBufferLen(res_d, res_o, 4);
    var ret = _sqlite3_prepare_v2(db_o, sql, bytes, hdl_ptr, res_ptr);
    var off = h$derefHeapPtr_addr(hdl_ptr);
    h$putHeapAddr(hdl_d,hdl_o,off);
    if(res_d !== null) {
      // FIXME: we shouldn't need the cstring here
      PUT_ADDR(res_d,res_o, h$copyCStringFromHeap(res_ptr), 0);
    }
    return ret;
  });
}

// sqlite3_db_handle :: Ptr CStatement -> IO (Ptr CDatabase)
function h$sqlite3_db_handle(stmt_d, stmt_o) {
  var ret = _sqlite3_db_handle(stmt_o);
  RETURN_UBX_TUP2(h$HEAP,ret);
}

// sqlite3_step :: Ptr CStatement -> IO CError
function h$sqlite3_step(stmt_d, stmt_o) {
  return _sqlite3_step(stmt_o);
}

// sqlite3_step_unsafe :: Ptr CStatement -> IO CError
function h$sqlite3_step_unsafe(stmt_d, stmt_o) {
  return _sqlite3_step_unsafe(stmt_o);
}

// sqlite3_reset :: Ptr CStatement -> IO CError
function h$sqlite3_reset(stmt_d, stmt_o) {
  return _sqlite3_reset(stmt_o);
}

// sqlite3_finalize :: Ptr CStatement -> IO CError
function h$sqlite3_finalize(stmt_d, stmt_o) {
  return _sqlite3_finalize(stmt_o);
}

// sqlite3_clear_bindings :: Ptr CStatement -> IO CError
function h$sqlite3_clear_bindings(stmt_d, stmt_o) {
  return _sqlite3_clear_bindings(stmt_o);
}

// sqlite3_sql :: Ptr CStatement -> IO CString
function h$sqlite3_sql(stmt_d, stmt_o) {
  var str = h$copyCStringFromHeap(_sqlite3_sql(stmt_o));
  RETURN_UBX_TUP2(str,0);
}

// sqlite3_bind_parameter_count :: Ptr CStatement -> IO CParamIndex
function h$sqlite3_bind_parameter_count(stmt_d, stmt_o) {
  return _sqlite3_bind_parameter_count(stmt_o);
}

// sqlite3_bind_parameter_name :: Ptr CStatement -> CParamIndex -> IO CString
function h$sqlite3_bind_parameter_name(stmt_d, stmt_o, idx) {
  var str = h$copyCStringFromHeap(_sqlite3_bind_parameter_name(stmt_o, idx));
  RETURN_UBX_TUP2(str,0);
}

// sqlite3_bind_parameter_index :: Ptr CStatement -> CString -> IO CParamIndex
function h$sqlite3_bind_parameter_index(stmt_d, stmt_o, str_d, str_o) {
  return h$withCStringOnHeap(str_d, str_o, function (str) {
    return _sqlite3_bind_parameter_index(stmt_o, str);
  });
}

// sqlite3_column_count :: Ptr CStatement -> IO CColumnCount
function h$sqlite3_column_count(stmt_d, stmt_o) {
  return _sqlite3_column_count(stmt_o);
}

// sqlite3_column_name :: Ptr CStatement -> CColumnIndex -> IO CString
function h$sqlite3_column_name(stmt_d, stmt_o, idx) {
  RETURN_UBX_TUP2(h$copyCStringFromHeap(_sqlite3_column_name(stmt_o, idx)), 0);
}

// sqlite3_bind_blob :: Ptr CStatement -> CParamIndex -> Ptr a -> CNumBytes -> Ptr CDestructor -> IO CError
function h$sqlite3_bind_blob(stmt_d, stmt_o, idx, ptr_d, ptr_o, bytes, destr_d, destr_o) {
  return h$withCBufferOnHeap(ptr_d, ptr_o, bytes, function (blob) {
    return _sqlite3_bind_blob(stmt_o, idx, blob, bytes, destr_o);
  });
}

// sqlite3_bind_zeroblob :: Ptr CStatement -> CParamIndex -> CInt -> IO CError
function h$sqlite3_bind_zeroblob(stmt_d, stmt_o, idx, n) {
  return _sqlite3_bind_zeroblob(stmt_o, idx, n);
}

// sqlite3_bind_text :: Ptr CStatement -> CParamIndex -> CString -> CNumBytes -> Ptr CDestructor -> IO CError
function h$sqlite3_bind_text(stmt_d, stmt_o, idx, str_d, str_o, bytes, destr_d, destr_o) {
  return h$withCBufferOnHeap(str_d, str_o, bytes, function(str) {
    // CDestructor is either (null, 0) for STATIC, or (null, -1) for TRANSIENT
    // we always free the string in the Emscripten heap right afterwards, so what
    // ever destructor is set, we are TRANSIENT in the emscripten heap!
    return _sqlite3_bind_text(stmt_o, idx, str, bytes, -1);
  });
}

// sqlite3_bind_double   :: Ptr CStatement -> CParamIndex -> Double -> IO CError
function h$sqlite3_bind_double(stmt_d, stmt_o, idx, dbl) {
  return _sqlite3_bind_double(stmt_o, idx, dbl);
}

// sqlite3_bind_int64    :: Ptr CStatement -> CParamIndex -> Int64 -> IO CError
function h$sqlite3_bind_int64(stmt_d, stmt_o, idx, val_msw, val_lsw) {
  return _sqlite3_bind_int64(stmt_o, idx, val_lsw, val_msw);
}

// sqlite3_bind_null     :: Ptr CStatement -> CParamIndex -> IO CError
function h$sqlite3_bind_null(stmt_d, stmt_o, idx) {
  return _sqlite3_bind_null(stmt_o, idx);
}

// sqlite3_column_type   :: Ptr CStatement -> CColumnIndex -> IO CColumnType
function h$sqlite3_column_type(stmt_d, stmt_o, idx) {
  return _sqlite3_column_type(stmt_o, idx);
}

// sqlite3_column_bytes  :: Ptr CStatement -> CColumnIndex -> IO CNumBytes
function h$sqlite3_column_bytes(stmt_d, stmt_o, idx) {
  return _sqlite3_column_bytes(stmt_o, idx);
}

// sqlite3_column_blob   :: Ptr CStatement -> CColumnIndex -> IO (Ptr a)
function h$sqlite3_column_blob(stmt_d, stmt_o, idx) {
  var off = _sqlite3_column_blob(stmt_o, idx);
  RETURN_UBX_TUP2(h$HEAP, off);
}

// sqlite3_column_text   :: Ptr CStatement -> CColumnIndex -> IO CString
function h$sqlite3_column_text(stmt_d, stmt_o, idx) {
  var off = _sqlite3_column_text(stmt_o, idx);
  RETURN_UBX_TUP2(h$HEAP, off);
}

// sqlite3_column_int64  :: Ptr CStatement -> CColumnIndex -> IO Int64
function h$sqlite3_column_int64(stmt_d, stmt_o, idx) {
  var l = _sqlite3_column_int64(stmt_o, idx);
  var h = getTempRet0();
  RETURN_INT64(h,l);
}

// sqlite3_column_double :: Ptr CStatement -> CColumnIndex -> IO Double
function h$sqlite3_column_double(stmt_d, stmt_o, idx) {
  return _sqlite3_column_double(stmt_o, idx);
}

// sqlite3_last_insert_rowid :: Ptr CDatabase -> IO Int64
function h$sqlite3_last_insert_rowid(stmt_d, stmt_o) {
  var l = _sqlite3_last_insert_rowid(stmt_o);
  var h = getTempRet0();
  RETURN_INT64(h,l);
}

// sqlite3_changes :: Ptr CDatabase -> IO CInt
function h$sqlite3_changes(stmt_d, stmt_o) {
  return _sqlite3_changes(stmt_o);
}

// sqlite3_total_changes :: Ptr CDatabase -> IO CInt
function h$sqlite3_total_changes(stmt_d, stmt_o) {
  return _sqlite3_total_changes(stmt_o);
}

// sqlite3_create_function_v2
//  :: Ptr CDatabase
//  -> CString
//  -> CArgCount
//  -> CInt
//  -> Ptr a
//  -> FunPtr CFunc
//  -> FunPtr CFunc
//  -> FunPtr CFuncFinal
//  -> FunPtr (CFuncDestroy a)
//  -> IO CError
function h$sqlite3_create_function_v2(db_d, db_o, name_d, name_o, nargs, enc, user_data_d, user_data_o, fun_d, fun_o, step_d, step_o, final_d, final_o, destroy_d, destroy_o) {
  var name = h$initHeapBuffer(name_d, name_o);

  // Ptr CContext -> CArgCount -> Ptr (Ptr CValue) -> IO ()
  var fun_ptr = h$registerFunPtrOnHeap(fun_d,fun_o,false, 'viii', (fun) => {
        return function(ctx_ptr, nargs, val_ptr) {
          var val_ptr_ = h$copyPtrArrayFromHeap(val_ptr, nargs);
          for(var i = 0; i < nargs; i++) {
            var off = val_ptr_.i3[i];
            h$putHeapAddr(val_ptr_, i*4, off);
          }
          fun(h$mkHeapPtr(ctx_ptr), nargs, {'array':val_ptr_,'offset':0});
        };
      });

  // Ptr CContext -> CArgCount -> Ptr (Ptr CValue) -> IO ()
  var step_ptr = h$registerFunPtrOnHeap(step_d, step_o,false, 'viii', (step) => {
        return function(ctx_ptr, nargs, val_ptr) {
          var val_ptr_ = h$copyPtrArrayFromHeap(val_ptr, nargs);
          for(var i = 0; i < nargs; i++) {
            var off = val_ptr_.i3[i];
            h$putHeapAddr(val_ptr_, i*4, off);
          }
          step(h$mkHeapPtr(ctx_ptr), nargs, {'array':val_ptr_,'offset':0});
        };
      });

  // Ptr CContext -> IO ()
  var final_ptr = h$registerFunPtrOnHeap(final_d, final_o, false, 'vi', (fin) => {
        return function(ctx_ptr) {
          fin(h$mkHeapPtr(ctx_ptr));
        };
      });

  // Ptr a -> IO ()
  var destroy_ptr = h$registerFunPtrOnHeap(destroy_d,destroy_o, true, 'vi', (destroy,destroy_ptr) => {
        return function(_user_data) {
          // we close over user_data here.
          destroy({'array':user_data_d, 'offset':user_data_o});

          // FIXME: for some reason, this doesn't work
          //if(fun_ptr != null) Module.removeFunction(fun_ptr);
          //if(step_ptr != null) Module.removeFunction(step_ptr);
          //if(final_ptr != null) Module.removeFunction(final_ptr);
          //if(destroy_ptr != null) Module.removeFunction(destroy_ptr);
        };
      });

  return _sqlite3_create_function_v2(db_o, name, nargs, enc, null, fun_ptr, step_ptr, final_ptr, destroy_ptr);
}

// sqlite3_aggregate_context :: Ptr CContext -> CNumBytes -> IO (Ptr a)
function h$sqlite3_aggregate_context(ctx_d, ctx_o, nbytes) {
  var off = _sqlite3_aggregate_context(ctx_o, nbytes);
  RETURN_UBX_TUP2(h$HEAP,off);
}

// sqlite3_value_type   :: Ptr CValue -> IO CColumnType
function h$sqlite3_value_type(val_d, val_o) {
  return _sqlite3_value_type(val_o);
}
// sqlite3_value_bytes  :: Ptr CValue -> IO CNumBytes
function h$sqlite3_value_bytes(val_d, val_o) {
  return _sqlite3_value_bytes(val_o);
}

// sqlite3_value_text   :: Ptr CValue -> IO CString
function h$sqlite3_value_text(val_d, val_o) {
  var off = _sqlite3_value_text(val_o);
  RETURN_UBX_TUP2(h$HEAP, off);
}

// sqlite3_value_int64  :: Ptr CValue -> IO Int64
function h$sqlite3_value_int64(val_d, val_o) {
  var l = _sqlite3_value_int64(val_o);
  var h = getTempRet0();
  RETURN_INT64(h,l);
}

// sqlite3_value_double :: Ptr CValue -> IO Double
function h$sqlite3_value_double(val_d, val_o) {
  return _sqlite3_value_double(val_o);
}

// sqlite3_result_text     :: Ptr CContext -> CString -> CNumBytes -> Ptr CDestructor -> IO ()
function h$sqlite3_result_text(ctx_d, ctx_o, str_d, str_o, nbytes, destr_d, destr_o) {
  var str = h$initHeapBufferLen(str_d, str_o, nbytes);
  var ret = _sqlite3_result_text(ctx_o, str, nbytes, null);
  //FIXME we should free the string
  return ret;
}

// sqlite3_result_int64    :: Ptr CContext -> Int64 -> IO ()
function h$sqlite3_result_int64(ctx_d, ctx_o, value_msw, value_lsw) {
  return _sqlite3_result_int64(ctx_o, value_lsw, value_msw);
}

// sqlite3_result_error    :: Ptr CContext -> CString -> CNumBytes -> IO ()
function h$sqlite3_result_error(ctx_d, ctx_o, str_d, str_o, nbytes) {
  return h$withOutBufferOnHeap(str_d, str_o, nbytes, function(str){
    return _sqlite3_result_error(ctx_o, str, nbytes);
  });
}

// sqlite3_create_collation_v2
//  :: Ptr CDatabase
//  -> CString                  -- collation name
//  -> CInt                     -- text representation (some constant)
//  -> Ptr a                    -- collation function user data
//  -> FunPtr (CCompare a)      -- collation function: Ptr a -> CNumBytes -> CString -> CNumBytes -> CString -> IO CInt
//  -> FunPtr (CFuncDestroy a)  -- cleanup function: Ptr a -> IO ()
//  -> IO CError
function h$sqlite3_create_collation_v2(db_d, db_o, name_d, name_o, flags, user_data_d, user_data_o, cmp_d, cmp_o, destroy_d, destroy_o) {

  var name = h$initHeapBuffer(name_d, name_o);

  var compare_ptr = h$registerFunPtrOnHeap(cmp_d,cmp_o, false, 'iiiiii', (compare) => {
        return function(_user_data,n1,str1,n2,str2) {
          // we directly capture and pass user_data here
          return compare({'array':user_data_d, 'offset':user_data_o},n1,h$mkHeapPtr(str1),n2,h$mkHeapPtr(str2));
        };
      });

  var destroy_ptr = h$registerFunPtrOnHeap(destroy_d,destroy_o, true, 'vi', (destroy,destroy_ptr) => {
        return function(_user_data) {
          h$unregisterFunPtrFromHeap(compare_ptr);
          h$unregisterFunPtrFromHeap(destroy_ptr);
          // we directly capture and pass user_data here
          return destroy({'array':user_data_d, 'offset':user_data_o});
        };
      });

  return _sqlite3_create_collation_v2(db_o, name, flags, null, compare_ptr, destroy_ptr);
}


// sqlite3_free :: Ptr a -> IO ()
function h$sqlite3_free(ptr_d, ptr_o) {
  return _sqlite3_free(ptr_d.i3[0]);
}

// sqlite3_blob_open
//  :: Ptr CDatabase
//  -> CString            -- database symbolic name
//  -> CString            -- table name
//  -> CString            -- column name
//  -> Int64              -- row index
//  -> CInt               -- flags
//  -> Ptr (Ptr CBlob)    -- returned pointer
//  -> IO CError
function h$sqlite3_blob_open(db_d, db_o, db_name_d, db_name_o, db_table_d, db_table_o, db_column_d, db_column_o, rowid_msw, rowid_lsw, flags, out_ptr_d, out_ptr_o) {
  var db_name   = h$initHeapBuffer(db_name_d, db_name_o);
  var db_table  = h$initHeapBuffer(db_table_d, db_table_o);
  var db_column = h$initHeapBuffer(db_column_d, db_column_o);
  var out_ptr   = _malloc(4);
  var ret       = _sqlite3_blob_open(db_o, db_name, db_table, db_column, rowid_lsw, rowid_msw, flags, out_ptr);
  // copy pointer out
  h$putHeapAddr(out_ptr_d, out_ptr_o, h$derefHeapPtr_addr(out_ptr));

  _free(out_ptr);
  _free(db_name);
  _free(db_table);
  _free(db_column);
  return ret;
}

// sqlite3_blob_close :: Ptr CBlob -> IO CError
function h$sqlite3_blob_close(blob_d, blob_o) {
  return _sqlite3_blob_close(blob_o);
}

// sqlite3_blob_bytes :: Ptr CBlob -> IO CInt
function h$sqlite3_blob_bytes(blob_d, blob_o) {
  return _sqlite3_blob_bytes(blob_o);
}

// sqlite3_blob_read :: Ptr CBlob -> Ptr a -> CInt -> CInt -> IO CError
function h$sqlite3_blob_read(blob_d, blob_o, out_ptr_d, out_ptr_o, nbytes, offset) {
  var out_ptr = out_ptr_d === null ? null : _malloc(nbytes);
  var ret = _sqlite3_blob_read(blob_o, out_ptr, nbytes, offset);
  h$copyFromHeap(out_ptr, out_ptr_d, out_ptr_o, nbytes);
  _free(out_ptr);
  return ret;
}

// sqlite3_blob_write :: Ptr CBlob -> Ptr a -> CInt -> CInt -> IO CError
function h$sqlite3_blob_write(blob_d, blob_o, in_ptr_d, in_ptr_o, nbytes, offset) {
  return h$withCBufferOnHeap(in_ptr_d, in_ptr_o, nbytes, function(in_ptr) {
    return _sqlite3_blob_write(blob_o, in_ptr, nbytes, offset);
  });
}

// sqlite3_extended_result_codes :: Ptr CDatabase -> Bool -> IO CError
function h$sqlite3_extended_result_codes(db_d, db_o, b) {
  return _sqlite3_extended_result_codes(db_o, b);
}

// TODO:
// sqlite3_user_data :: Ptr CContext -> IO (Ptr a)
// sqlite3_context_db_handle :: Ptr CContext -> IO (Ptr CDatabase)
// sqlite3_enable_shared_cache :: Bool -> IO CError
// sqlite3_value_blob   :: Ptr CValue -> IO (Ptr a)
// sqlite3_result_null     :: Ptr CContext -> IO ()
// sqlite3_result_blob     :: Ptr CContext -> Ptr a -> CNumBytes -> Ptr CDestructor -> IO ()
// sqlite3_result_zeroblob :: Ptr CContext -> CNumBytes -> IO ()
// sqlite3_result_double   :: Ptr CContext -> Double -> IO ()
// sqlite3_result_value    :: Ptr CContext -> Ptr CValue -> IO ()
// sqlite3_free_p :: FunPtr (Ptr a -> IO ())
// sqlite3_enable_load_extension :: Ptr CDatabase -> Bool -> IO CError
// sqlite3_wal_hook :: Ptr CDatabase -> FunPtr CWalHook -> Ptr a -> IO (Ptr ())
// sqlite3_blob_reopen :: Ptr CBlob -> Int64 -> IO CError
// sqlite3_backup_init :: Ptr CDatabase -> CString -> Ptr CDatabase -> CString -> IO (Ptr CBackup)
// sqlite3_backup_finish :: Ptr CBackup -> IO CError
// sqlite3_backup_step :: Ptr CBackup -> CInt -> IO CError
// sqlite3_backup_remaining :: Ptr CBackup -> IO CInt
// sqlite3_backup_pagecount :: Ptr CBackup -> IO CInt
