import axios from "axios";
import {
  VESICASH_API_URL,
  VESICASH_PRIVATE_KEY_TOKEN,
  VESICASH_PUBLIC_KEY_TOKEN,
  VESICASH_AUTH_TOKEN,
} from "@/utilities/constant";
import { getStorage } from "@/utilities/auth-utils";
import $api from "@/services/service-api";

const routes = {
  location: "https://ip2c.org/s",
  upload_file: "/upload/file",
  country_bank_list: "/admin/banks/country",
  verify_account: "/payment/banks/account_verification",
};

let formData = new FormData();
let axiosSource = axios.CancelToken.source();

export default {
  // ==============================
  // GET CURRENT USER LOCATION
  // ==============================
  async getMyLocation() {
    return await $api.fetchRaw(routes.location);
  },

  // ================================
  // UPLOAD FILE ATTACHMENT
  // ================================
  async uploadFile(_, payload) {
    formData.append("files[0]", payload);
    return await $api.push(routes.upload_file, { formData, is_attach: true });
  },

  // ======================================
  // UPLOAD FILE TO DIGITAL SPACE
  // ======================================
  async uploadToSpace({ commit }, { file, formatted_size }) {
    const authUserToken = getStorage(VESICASH_AUTH_TOKEN) || null;

    formData.append("files[0]", file);

    try {
      const response = await axios.post(
        `${VESICASH_API_URL}${routes.upload_file}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authUserToken}`,
            "Content-Type": "multipart/form-data",
            "V-PUBLIC-KEY": VESICASH_PUBLIC_KEY_TOKEN,
            "V-PRIVATE-KEY": VESICASH_PRIVATE_KEY_TOKEN,
          },
          onUploadProgress: function (progressEvent) {
            let progress_count = parseInt(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );

            commit("UPDATE_FILE_PROGRESS", {
              name: file.name,
              size: formatted_size,
              progress: progress_count,
              uploading: true,
            });
          }.bind(this),

          cancelToken: axiosSource.token,
        }
      );

      // UPDATE FILE STATE

      if (response.data.code === 200) {
        commit(
          "transactions/UPDATE_TRANSACTION_ATTACHMENT",
          [
            {
              name: file.name,
              url: response?.data?.data?.urls[0],
            },
          ],
          { root: true }
        );

        commit("UPDATE_FILE_PROGRESS", {
          name: file.name,
          size: formatted_size,
          progress: 0,
          uploading: false,
        });
      } else {
        commit("UPDATE_FILE_PROGRESS", {
          name: "",
          size: "",
          progress: 0,
          uploading: false,
        });
      }

      return response.data;
    } catch (error) {
      return error;
    }
  },

  // ======================================
  // UPLOAD FILE TO DIGITAL CLOUD [MULTIPLE FILES]
  // ======================================
  async uploadToCloud({ commit }, { files, id }) {
    const authUserToken = getStorage(VESICASH_AUTH_TOKEN) || null;

    let form_data = new FormData();

    files.forEach((file, index) => {
      form_data.append(`files[${index}]`, file);
    });

    try {
      const response = await axios.post(
        `${VESICASH_API_URL}${routes.upload_file}`,
        form_data,
        {
          headers: {
            Authorization: `Bearer ${authUserToken}`,
            "Content-Type": "multipart/form-data",
            "V-PUBLIC-KEY": VESICASH_PUBLIC_KEY_TOKEN,
            "V-PRIVATE-KEY": VESICASH_PRIVATE_KEY_TOKEN,
          },

          onUploadProgress: function (progressEvent) {
            let progress_count = parseInt(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );

            const updated_files_state = files.map((file) => {
              return {
                name: file.name,
                size: file.formatted_size,
                progress: progress_count,
                uploading: true,
              };
            });

            commit("UPDATE_ALL_FILES_PROGRESS", {
              id,
              files: updated_files_state,
            });
          }.bind(this),

          cancelToken: axiosSource.token,
        }
      );

      // UPDATE FILE STATE

      if (response.data.code === 200) {
       
        const updated_files_state = files.map((file, index) => {
          const formatted_file = {
            name: file.name,
            size: file.formatted_size,
            progress: 0,
            uploading: false,
            url: response.data.data.urls[index],
          };
          return formatted_file;
        });

        commit("UPDATE_ALL_FILES_PROGRESS", { id, files: updated_files_state });
      } else {
        commit("UPDATE_ALL_FILES_PROGRESS", { id, files: [] });
      }

      return response.data;
    } catch (error) {
      return error;
    }
  },

  // ======================================
  // CLEAR OUT UPLOAADED  FILE ATTACHMENT
  // =======================================
  clearAttachedFile({ commit }) {
    commit("transactions/UPDATE_TRANSACTION_ATTACHMENT", [], { root: true });
    commit("UPDATE_FILE_PROGRESS", {
      name: "",
      size: "",
      progress: 0,
      uploading: false,
    });
  },

  // ======================================
  // CLEAR OUT ALL FILES ATTACHMENT
  // =======================================
  clearAllAttachedFiles({ commit }) {
    commit("UPDATE_ALL_FILES_PROGRESS", [
      {
        name: "",
        size: "",
        progress: 0,
        uploading: false,
      },
    ]);
  },

  // ==============================
  // GET ALL BANKS IN A COUNTRY
  // ==============================
  async getAllBanks(_, country) {
    return await $api.push(routes.country_bank_list, { payload: { country } });
  },

  // ==============================
  // VERIFY BANK ACCOUNT
  // ==============================
  async verifyBankAccount(_, { bank_code, account_number }) {
    return await $api.fetch(
      `${routes.verify_account}?bank_code=${bank_code}&account_number=${account_number}`
    );
  },
};
