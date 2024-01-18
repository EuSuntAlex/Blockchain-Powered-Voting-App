import { useEffect, useState } from 'react';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { Button } from 'components/Button';
import { ContractAddress } from 'components/ContractAddress';
import { OutputContainer, PingPongOutput } from 'components/OutputContainer';
import { useGetTimeToPong, useGetPingAmount } from './hooks';
import * as React from 'react';
import { Address } from '@multiversx/sdk-core';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { refreshAccount } from '@multiversx/sdk-dapp/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';
import { contractAddress } from 'config';
import 'react-datepicker/dist/react-datepicker.css';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '300px', // Adjust the width to your preference
    minHeight: '400px', // Adjust the height to your preference
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #ccc', // Add box shadow for a nicer look
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)'
  }
};

function decimalToHexadecimal(decimalStr: string): string {
  const decimalValue = parseInt(decimalStr, 10); // Parse the decimal string to an integer
  if (isNaN(decimalValue)) {
    throw new Error('Invalid input. Please provide a valid decimal string.');
  }

  const hexadecimalValue = decimalValue.toString(16); // Convert the integer to hexadecimal
  if (hexadecimalValue.length % 2 == 0) {
    return hexadecimalValue;
  } else return '0' + hexadecimalValue;
}

function stringToHex(input: string | undefined): string {
  if (input === undefined) {
    return '';
  } else
    return Array.from(input)
      .map((char) => char.charCodeAt(0).toString(16))
      .join('');
}

const CreateVoteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateVote: (arg1: string, arg2: string, arg3: string) => void;
}> = ({ isOpen, onClose, onCreateVote }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput2(e.target.value);
  };

  const handleInputChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput3(e.target.value);
  };

  const handleCreateVote = () => {
    // Convert user inputs to hexadecimal
    const arg2Hex = decimalToHexadecimal(input2);
    const arg3Hex = stringToHex(input3);

    if (selectedDate === null) {
      const currentTimestampInSeconds: number = Math.floor(
        new Date().getTime() / 1000
      );
      const arg1Hex = decimalToHexadecimal(
        currentTimestampInSeconds.toString()
      );
      onCreateVote(arg1Hex, arg2Hex, arg3Hex);
    } else {
      const currentTimestampInSeconds: number = Math.floor(
        selectedDate.getTime() / 1000
      );
      const arg1Hex = decimalToHexadecimal(
        currentTimestampInSeconds.toString()
      );
      onCreateVote(arg1Hex, arg2Hex, arg3Hex);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel='Create Vote Modal'
    >
      <h2>Create Vote</h2>
      <div className="modal-content">
        {/* Individual fields with borders */}
        <div className="modal-field">
          <label>Vote name:</label>
          <input
            type='text'
            placeholder='Vote name'
            value={input3}
            onChange={handleInputChange3}
            maxLength={20}
            minLength={3}
          />
        </div>

        <div className="modal-field">
          <label>Voting Options:</label>
          <input
            type='text'
            placeholder='Number'
            value={input2}
            onChange={handleInputChange2}
            maxLength={10}
          />
        </div>

        <div className="modal-field">
          <label>Enter Deadline:</label>
          {/* Date Picker */}
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            dateFormat='MM/dd/yyyy HH:mm:ss'
            placeholderText='Select Deadline Date'
          />
        </div>
        {/* Buttons with left and right alignment */}
        <div className="modal-buttons" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button onClick={handleCreateVote} className="create-button">
            Create Vote
          </Button>
          <Button onClick={onClose} className="cancel-button">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const VoteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onVote: (arg1: string, arg2: string) => void;
}> = ({ isOpen, onClose, onVote }) => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const handleInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput1(e.target.value);
  };

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput2(e.target.value);
  };

  const handleVote = () => {
    // Convert user inputs to hexadecimal
    const arg1Hex = stringToHex(input1);
    const arg2dec = decimalToHexadecimal(input2);
    onVote(arg1Hex, arg2dec);

    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2>Vote</h2>
      <div className="modal-content">
        <div className="modal-field">
          <label>Vote Name:</label>
          <input
            type='text'
            placeholder='Enter Vote Name'
            value={input1}
            onChange={handleInputChange1}
            maxLength={20}
            minLength={2}
          />
        </div>
        <div className="modal-field">
          <label>Voting Option:</label>
          <input
            type='text'
            placeholder='Enter Voting Option'
            value={input2}
            onChange={handleInputChange2}
          />
        </div>
        <div className="modal-buttons">
          <Button onClick={handleVote} className="left-button">
            Vote
          </Button>
          <Button onClick={onClose} className="right-button">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ResultModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onResult: (arg1: string) => void;
}> = ({ isOpen, onClose, onResult }) => {
  const [input1, setInput1] = useState('');

  const handleInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput1(e.target.value);
  };

  const handleResult = () => {
    // Convert user inputs to hexadecimal
    const arg1Hex = stringToHex(input1);
    onResult(arg1Hex);

    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2>Enter the Vote Name</h2>
      <div className="modal-content">
        <div className="modal-field">
          <label>Vote Name:</label>
          <input
            type='text'
            placeholder='Enter Vote Name'
            value={input1}
            onChange={handleInputChange1}
            maxLength={20}
            minLength={3}
          />
        </div>
        <div className="modal-buttons">
          <Button onClick={handleResult} className="left-button">
            Result
          </Button>
          <Button onClick={onClose} className="right-button">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const VipSomebodyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSetVip: (arg1: string, arg2: string, arg3: string) => void;
}> = ({ isOpen, onClose, onSetVip }) => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  const handleInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput1(e.target.value);
  };

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput2(e.target.value);
  };

  const handleInputChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput3(e.target.value);
  };

  const handleSetVip = () => {
    const arg2Hex = decimalToHexadecimal(input2);
    const arg3Hex = stringToHex(input3);
    const arg1Hex = Address.fromBech32(input1).hex();

    onSetVip(arg1Hex, arg2Hex, arg3Hex);
    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2>Vip Somebody</h2>
      <div className="modal-content">
        <div className="modal-field">
          <label>VIP Address:</label>
          <input
            type='text'
            placeholder='Enter VIP Address'
            value={input1}
            onChange={handleInputChange1}
            maxLength={63}
            minLength={63}
          />
        </div>
        <div className="modal-field">
          <label>Voting Power:</label>
          <input
            type='text'
            placeholder='Enter Voting Power'
            value={input2}
            onChange={handleInputChange2}
          />
        </div>
        <div className="modal-field">
          <label>Enter Vote:</label>
          <input
            type='text'
            placeholder='Enter Vote'
            value={input3}
            onChange={handleInputChange3}
          />
        </div>
        <div className="modal-buttons">
          <Button onClick={handleSetVip} className="left-button">
            Set VIP
          </Button>
          <Button onClick={onClose} className="right-button">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const VipYourselfModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSetVip2: (arg1: string, arg2: string, arg3: string) => void;
}> = ({ isOpen, onClose, onSetVip2 }) => {
  const { address } = useGetAccountInfo();
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput2(e.target.value);
  };

  const handleInputChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput3(e.target.value);
  };
  const handleSetVip2 = () => {
    const arg2Hex = decimalToHexadecimal(input2);
    const arg3Hex = stringToHex(input3);
    const arg1Hex = Address.fromBech32(address).hex();

    onSetVip2(arg1Hex, arg2Hex, arg3Hex);
    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2>Vip Yourself</h2>
      <div className="modal-content">
        <div className="modal-field">
          <label>Voting Power:</label>
          <input
            type='text'
            placeholder='Enter Voting Power'
            value={input2}
            onChange={handleInputChange2}
          />
        </div>
        <div className="modal-field">
          <label>Enter Vote:</label>
          <input
            type='text'
            placeholder='Enter Vote'
            value={input3}
            onChange={handleInputChange3}
          />
        </div>
        <div className="modal-buttons">
          <Button onClick={handleSetVip2} className="left-button">
            Set VIP
          </Button>
          <Button onClick={onClose} className="right-button">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export const PingPongRaw = () => {
  const /*transactionSessionId*/ [, setTransactionSessionId] = useState<
      string | null
    >(null);

  const [isFirstModalOpen, setFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setThirdModalOpen] = useState(false);
  const [isForthModalOpen, setForthModalOpen] = useState(false);
  const [isFifthModalOpen, setFifthModalOpen] = useState(false);

  const openFirstModal = () => setFirstModalOpen(true);
  const closeFirstModal = () => setFirstModalOpen(false);

  const openSecondModal = () => setSecondModalOpen(true);
  const closeSecondModal = () => setSecondModalOpen(false);

  const openThirdModal = () => setThirdModalOpen(true);
  const closeThirdModal = () => setThirdModalOpen(false);

  const openForthModal = () => setForthModalOpen(true);
  const closeForthModal = () => setForthModalOpen(false);

  const openFifthModal = () => setFifthModalOpen(true);
  const closeFifthModal = () => setFifthModalOpen(false);

  const createVote = async (arg1: string, arg2: string, arg3: string) => {
    const CreateVoteTransaction = {
      value: '0',
      data: 'create_vote@' + arg1 + '@' + arg2 + '@' + arg3,
      receiver: contractAddress,
      gasLimit: '600000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: CreateVoteTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Vote Creation',
        errorMessage: 'An error has occured during vote creation',
        successMessage: 'A new Vote has been created successfully'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const Vote = async (arg1: string, arg2: string) => {
    const mintTransaction = {
      value: '0',
      data: 'vote' + '@' + arg1 + '@' + arg2,
      receiver: contractAddress,
      gasLimit: '600000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: mintTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing Vote',
        errorMessage: 'An error has occured Voting',
        successMessage: 'Voting successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const setVip = async (arg1: string, arg2: string, arg3: string) => {
    const Vip2Transaction = {
      value: '0',
      data: 'add_vip' + '@' + arg1 + '@' + arg2 + '@' + arg3,
      receiver: contractAddress,
      gasLimit: '600000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: Vip2Transaction,
      transactionsDisplayInfo: {
        processingMessage: 'Processing The Transaction',
        errorMessage: 'An error has occured during the Transaction',
        successMessage: 'VIP set Successfuly'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  const Result = async (arg1: string) => {
    const endEventTransaction = {
      value: '0',
      data: 'calculate_result' + '@' + arg1,
      receiver: contractAddress,
      gasLimit: '600000000'
    };
    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
      transactions: endEventTransaction,
      transactionsDisplayInfo: {
        processingMessage: 'Retreiving Result',
        errorMessage: 'An error has occured while retrieving result',
        successMessage: 'retreiving Successful'
      },
      redirectAfterSign: false
    });
    if (sessionId != null) {
      setTransactionSessionId(sessionId);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex justify-start gap-2'>
          <Button
            disabled={false}
            onClick={openFirstModal}
            data-testid='btnPingService'
            data-cy='transactionBtn'
          >
            <FontAwesomeIcon icon={faArrowUp} className='mr-1' />
            Create Vote
          </Button>
          <CreateVoteModal
              isOpen={isFirstModalOpen}
              onClose={closeFirstModal}
              onCreateVote={createVote}
            />
          <Button
            disabled={false}
            onClick={openSecondModal}
            data-testid='btnPingService'
            data-cy='transactionBtn'
          >
            <FontAwesomeIcon icon={faArrowDown} className='mr-1' />
            Vote
          </Button>
          <VoteModal
              isOpen={isSecondModalOpen}
              onClose={closeSecondModal}
              onVote={Vote}
            />
          <Button
            disabled={false}
            onClick={openThirdModal}
            data-testid='btnPingService'
            data-cy='transactionBtn'
          >
            <FontAwesomeIcon icon={faArrowDown} className='mr-1' />
            VIP Yourself
          </Button>
          <VipYourselfModal
              isOpen={isThirdModalOpen}
              onClose={closeThirdModal}
              onSetVip2={setVip}
            />
          <Button
            disabled={false}
            onClick={openForthModal}
            data-testid='btnPingService'
            data-cy='transactionBtn'
          >
            <FontAwesomeIcon icon={faArrowDown} className='mr-1' />
            VIP Somebody
          </Button>
          <VipSomebodyModal
              isOpen={isForthModalOpen}
              onClose={closeForthModal}
              onSetVip={setVip}
            />
          <Button
            disabled={false}
            onClick={openFifthModal}
            data-testid='btnPingService'
            data-cy='transactionBtn'
          >
            <FontAwesomeIcon icon={faArrowDown} className='mr-1' />
            Get Result
          </Button>
          <ResultModal
              isOpen={isFifthModalOpen}
              onClose={closeFifthModal}
              onResult={Result}
            />
        </div>
      </div>
      <OutputContainer>
        <ContractAddress />
      </OutputContainer>
    </div>
  );
};
