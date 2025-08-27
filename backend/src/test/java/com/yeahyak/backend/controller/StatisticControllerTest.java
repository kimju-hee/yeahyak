package com.yeahyak.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yeahyak.backend.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@AutoConfigureMockMvc
@ActiveProfiles("test")
@SpringBootTest
@Import(TestSecurityConfig.class)
class StatisticControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void 가맹점_통계_조회_성공() throws Exception {
        mockMvc.perform(get("/api/statistics/branch")
                        .param("pharmacyId", "1")
                        .param("start", "2025-07-01")
                        .param("end", "2025-07-31"))
                .andExpect(status().isOk())
                .andDo(print());
    }
}
