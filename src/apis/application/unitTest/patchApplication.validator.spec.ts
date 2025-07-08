import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ApplicationQuery } from '../application.query';
import { PatchApplicationValidator } from '../validators';

describe('PatchApplicationValidator', () => {
    let validator: PatchApplicationValidator<any>;
    let applicationQueryMock: { agentExists: jest.Mock };

    beforeEach(async () => {
        applicationQueryMock = {
            agentExists: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PatchApplicationValidator,
                {
                    provide: ApplicationQuery,
                    useValue: applicationQueryMock,
                },
            ],
        }).compile();

        validator = module.get<PatchApplicationValidator<any>>(PatchApplicationValidator);
    });

    it('should return target unchanged when no IDs are provided', async () => {
        const target = {};
        const result = await validator.transform(target);

        expect(result).toBe(target);
        expect(applicationQueryMock.agentExists).not.toHaveBeenCalled();
    });

    it('should validate underwriterUserIDs if provided', async () => {
        applicationQueryMock.agentExists.mockResolvedValue(true);

        const target = { underwriterUserIDs: ['id1', 'id2'] };
        const result = await validator.transform(target);

        expect(result).toBe(target);
        expect(applicationQueryMock.agentExists).toHaveBeenCalledTimes(2);
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('id1');
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('id2');
    });

    it('should validate agentID if provided', async () => {
        applicationQueryMock.agentExists.mockResolvedValue(true);

        const target = { agentID: 'agent1' };
        const result = await validator.transform(target);

        expect(result).toBe(target);
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('agent1');
    });

    it('should throw NotFoundException if an underwriter agent does not exist', async () => {
        applicationQueryMock.agentExists.mockImplementation((id) => Promise.resolve(id !== 'invalid'));

        const target = { underwriterUserIDs: ['valid', 'invalid'] };

        await expect(validator.transform(target)).rejects.toThrow(NotFoundException);
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('invalid');
    });

    it('should throw NotFoundException if agentID does not exist', async () => {
        applicationQueryMock.agentExists.mockResolvedValue(false);

        const target = { agentID: 'missingAgent' };

        await expect(validator.transform(target)).rejects.toThrow(NotFoundException);
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('missingAgent');
    });

    it('should validate both agentID and underwriterUserIDs if both are provided', async () => {
        applicationQueryMock.agentExists.mockResolvedValue(true);

        const target = {
            agentID: 'agentX',
            underwriterUserIDs: ['id1', 'id2'],
        };

        const result = await validator.transform(target);

        expect(result).toBe(target);
        expect(applicationQueryMock.agentExists).toHaveBeenCalledTimes(3);
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('id1');
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('id2');
        expect(applicationQueryMock.agentExists).toHaveBeenCalledWith('agentX');
    });
});
