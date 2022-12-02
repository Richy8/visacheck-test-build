export default {
  UPDATE_FILE_PROGRESS: (state, payload) => {
    state.file = payload;
  },

  UPDATE_ALL_FILES_PROGRESS: (state, { id, files }) => {
    state.all_files.push({
      id,
      files,
    });
  },

  REMOVE_UPLOADED_FILE: (state, { id, index }) => {
    const file_index = state.all_files.findIndex((file) => file.id === id);
    if (file_index !== -1) {
      if (state.all_files[file_index]?.files?.length === 1) {
        state.all_files.splice(file_index, 1);
        return;
      }
      state.all_files[file_index].files.splice(index, 1);
    }
  },
};
