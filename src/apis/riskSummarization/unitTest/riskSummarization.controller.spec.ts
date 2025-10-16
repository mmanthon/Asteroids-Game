import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { userID } from '../../../apis/application/mocks';
import { UpdateRiskSummarizationRequestDto } from '../dto';
import { mockRiskSummarizationResponseDto, mockUpdateRiskSummarizationRequestDto, riskSummarizationId } from '../mocks';
import { RiskSummarizationController } from '../riskSummarization.controller';
import { RiskSummarizationService } from '../riskSummarization.service';

const mockAuthReq = (overrides: Partial<any> = {}) => ({ user: { id: userID }, ...overrides } as any);

describe('RiskSummarizationController', () => {
    let controller: RiskSummarizationController;
    let service: jest.Mocked<RiskSummarizationService>;

    beforeEach(async () => {
        const serviceMock: Partial<jest.Mocked<RiskSummarizationService>> = {
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RiskSummarizationController],
            providers: [{ provide: RiskSummarizationService, useValue: serviceMock }],
        }).compile();

        controller = module.get(RiskSummarizationController);
        service = module.get(RiskSummarizationService) as jest.Mocked<RiskSummarizationService>;
    });

    it('should call service.update with correct args and return its result', async () => {
        const req = mockAuthReq({ user: { id: userID } });

        service.update.mockResolvedValue(mockRiskSummarizationResponseDto);

        const result = await controller.update(riskSummarizationId, mockUpdateRiskSummarizationRequestDto, req);

        expect(service.update).toHaveBeenCalledTimes(1);
        expect(service.update).toHaveBeenCalledWith(
            riskSummarizationId,
            mockUpdateRiskSummarizationRequestDto,
            req.user,
        );
        expect(result).toEqual(mockRiskSummarizationResponseDto);
    });

    it('should propagate NotFoundException from service', async () => {
        const dto: UpdateRiskSummarizationRequestDto = {
            userFeedback: {
                isHelpful: true,
                categories: [],
            },
        };
        const req = mockAuthReq();

        service.update.mockRejectedValue(new NotFoundException('not found'));

        await expect(controller.update(riskSummarizationId, dto, req)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should propagate BadRequestException from service', async () => {
        const req = mockAuthReq();

        service.update.mockRejectedValue(new BadRequestException('reason required'));

        await expect(
            controller.update(riskSummarizationId, mockUpdateRiskSummarizationRequestDto, req),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
