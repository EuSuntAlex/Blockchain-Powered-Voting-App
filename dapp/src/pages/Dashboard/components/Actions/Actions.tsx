import * as React from 'react';
import { useState } from 'react';
import {
  faArrowDown,
  faTicket,
  faPlus,
  faUserCheck,
  faTicketSimple,
  faBitcoinSign
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Address } from '@multiversx/sdk-core';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { refreshAccount } from '@multiversx/sdk-dapp/utils';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import { contractAddress } from 'config';
import 'react-datepicker/dist/react-datepicker.css';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '300px', // Adjust the width to your preference
    padding: '20px',
    borderRadius: '10px'
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

function convertToEGLD(input: number): string {
  // Multiply the input by 10^18
  const result = input * Math.pow(10, 18);

  // Convert the result to a string
  return result.toString();
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
  onCreateVote: (
    arg1: string,
    arg2: string,
    arg3: string
    // arg4: string
  ) => void;
}> = ({ isOpen, onClose, onCreateVote }) => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null); // State to store the selected date

  const handleInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput1(e.target.value);
  };

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput2(e.target.value);
  };

  const handleInputChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput3(e.target.value);
  };

  const handleCreateVote = () => {
    // Convert user inputs to hexadecimal
    const arg1Hex = decimalToHexadecimal(input1);
    const arg2Hex = decimalToHexadecimal(input2);

    const arg3Hex = stringToHex(input3);
    // if (selectedDate === null) {
    //   const currentTimestampInSeconds: number = Math.floor(
    //     new Date().getTime() / 1000
    //   );
    //   const arg4Hex = decimalToHexadecimal(
    //     currentTimestampInSeconds.toString()
    //   );
    //   // Call the function with user inputs as arguments
    //   onCreateCollection(arg1Hex, arg2Hex, arg3Hex, arg4Hex);
    // } else {
    //   const currentTimestampInSeconds: number = Math.floor(
    //     selectedDate.getTime() / 1000
    //   );
    //   const arg4Hex = decimalToHexadecimal(
    //     currentTimestampInSeconds.toString()
    //   );
    //   // Call the function with user inputs as arguments
    //   onCreateCollection(arg1Hex, arg2Hex, arg3Hex, arg4Hex);
    // }

    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2>Create a new Vote</h2>
      <input
        type='text'
        placeholder='Vote name'
        value={input3}
        onChange={handleInputChange3}
        maxLength={20}
        minLength={3}
      />
      <input
        type='text'
        placeholder='Enter Voting Options'
        value={input2}
        onChange={handleInputChange2}
        maxLength={10}
      />
      <input
        type='text'
        placeholder='Enter Deadline'
        value={input1}
        onChange={handleInputChange1}
      />

      {/* Date Picker */}
      {/* <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => setSelectedDate(date)}
        dateFormat='MM/dd/yyyy'
        placeholderText='Select Date'
      /> */}

      <button onClick={handleCreateVote}>Create Vote</button>
      <button onClick={onClose}>Cancel</button>
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
    // const arg2U64 = new U64Value(input2);
    onVote(arg1Hex, arg2dec);

    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2>Vote</h2>
      <input
        type='text'
        placeholder='Enter Vote Name'
        value={input1}
        onChange={handleInputChange1}
        maxLength={20}
        minLength={2}
      />
      <input
        type='text'
        placeholder='Enter voting option'
        value={input2}
        onChange={handleInputChange2}
      />
      <button onClick={handleVote}>Vote</button>
      <button onClick={onClose}>Cancel</button>
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
      <input
        type='text'
        placeholder='Enter Vote Name'
        value={input1}
        onChange={handleInputChange1}
        maxLength={20}
        minLength={3}
      />
      <button onClick={handleResult}>Result</button>
      <button onClick={onClose}>Cancel</button>
    </Modal>
  );
};

// const EndModal: React.FC<{
//   isOpen: boolean;
//   onClose: () => void;
//   onEndEvent: (arg1: string) => void;
// }> = ({ isOpen, onClose, onEndEvent }) => {
//   const [input1, setInput1] = useState('');

//   const handleInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInput1(e.target.value);
//   };

//   const handleEndEvent = () => {
//     // Convert user inputs to hexadecimal
//     const arg1Hex = stringToHex(input1);
//     onEndEvent(arg1Hex);

//     // Close the modal
//     onClose();
//   };

//   return (
//     <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
//       <h2>End the Event</h2>
//       <input
//         type='text'
//         placeholder='Enter Event Name'
//         value={input1}
//         onChange={handleInputChange1}
//         maxLength={20}
//         minLength={3}
//       />
//       <button onClick={handleEndEvent}>End Event</button>
//       <button onClick={onClose}>Cancel</button>
//     </Modal>
//   );
// };

// const CancelModal: React.FC<{
//   isOpen: boolean;
//   onClose: () => void;
//   onCancelEvent: (arg1: string) => void;
// }> = ({ isOpen, onClose, onCancelEvent }) => {
//   const [input1, setInput1] = useState('');

//   const handleInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInput1(e.target.value);
//   };

//   const handleCancelEvent = () => {
//     // Convert user inputs to hexadecimal
//     const arg1Hex = stringToHex(input1);
//     onCancelEvent(arg1Hex);

//     // Close the modal
//     onClose();
//   };

//   return (
//     <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
//       <h2>Cancel Event</h2>
//       <input
//         type='text'
//         placeholder='Enter Event Name'
//         value={input1}
//         onChange={handleInputChange1}
//         maxLength={20}
//         minLength={3}
//       />
//       <button onClick={handleCancelEvent}>CancelEvent</button>
//       <button onClick={onClose}>Cancel</button>
//     </Modal>
//   );
// };

// const ValidateModal: React.FC<{
//   isOpen: boolean;
//   onClose: () => void;
//   onValidateNFT: (arg1: string, arg2: string) => void;
// }> = ({ isOpen, onClose, onValidateNFT }) => {
//   const [input1, setInput1] = useState('');
//   const [input2, setInput2] = useState('');

//   const handleInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInput1(e.target.value);
//   };

//   const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInput2(e.target.value);
//   };

//   const handleValidateNFT = () => {
//     // Convert user inputs to hexadecimal
//     const arg1Hex = stringToHex(input1);
//     const arg2Hex = decimalToHexadecimal(input2);

//     onValidateNFT(arg1Hex, arg2Hex);
//     // Close the modal
//     onClose();
//   };

//   return (
//     <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
//       <h2>Validate Ticket</h2>
//       <input
//         type='text'
//         placeholder='Enter Event Name'
//         value={input1}
//         onChange={handleInputChange1}
//         maxLength={20}
//         minLength={3}
//       />
//       <input
//         type='text'
//         placeholder='Enter Ticket Number (Nonce)'
//         value={input2}
//         onChange={handleInputChange2}
//       />
//       <button onClick={handleValidateNFT}>Validate Ticket</button>
//       <button onClick={onClose}>Cancel</button>
//     </Modal>
//   );
// };

export const Actions = () => {
  const /*transactionSessionId*/ [, setTransactionSessionId] = useState<
      string | null
    >(null);

  const [isFirstModalOpen, setFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setSecondModalOpen] = useState(false);
  const [isThirdModalOpen, setThirdModalOpen] = useState(false);
  // const [isForthModalOpen, setForthModalOpen] = useState(false);
  // const [isFifthModalOpen, setFifthModalOpen] = useState(false);
  // const [isSixthModalOpen, setSixthModalOpen] = useState(false);
  // const [isSeventhModalOpen, setSeventhModalOpen] = useState(false);

  const openFirstModal = () => setFirstModalOpen(true);
  const closeFirstModal = () => setFirstModalOpen(false);

  const openSecondModal = () => setSecondModalOpen(true);
  const closeSecondModal = () => setSecondModalOpen(false);

  const openThirdModal = () => setThirdModalOpen(true);
  const closeThirdModal = () => setThirdModalOpen(false);

  // const openForthModal = () => setForthModalOpen(true);
  // const closeForthModal = () => setForthModalOpen(false);

  // const openFifthModal = () => setFifthModalOpen(true);
  // const closeFifthModal = () => setFifthModalOpen(false);

  // const openSixthModal = () => setSixthModalOpen(true);
  // const closeSixthModal = () => setSixthModalOpen(false);

  // const openSeventhModal = () => setSeventhModalOpen(true);
  // const closeSeventhModal = () => setSeventhModalOpen(false);

  const createVote = async (
    arg1: string,
    arg2: string,
    arg3: string
    // arg4: string
  ) => {
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

  // const buyTicket = async (arg1: string, arg2: string) => {
  //   const buyTransaction = {
  //     value: arg2,
  //     data: 'buy_ticket' + '@' + arg1,
  //     receiver: contractAddress,
  //     gasLimit: '600000000'
  //   };
  //   await refreshAccount();

  //   const { sessionId /*, error*/ } = await sendTransactions({
  //     transactions: buyTransaction,
  //     transactionsDisplayInfo: {
  //       processingMessage: 'Processing The Transaction',
  //       errorMessage: 'An error has occured during the buying process',
  //       successMessage: 'Ticket bought successfully'
  //     },
  //     redirectAfterSign: false
  //   });
  //   if (sessionId != null) {
  //     setTransactionSessionId(sessionId);
  //   }
  // };

  // const validate = async (arg1: string, arg2: string) => {
  //   const validateTransaction = {
  //     value: '0',
  //     data: 'validate' + '@' + arg1 + '@' + arg2,
  //     receiver: contractAddress,
  //     gasLimit: '600000000'
  //   };

  //   await refreshAccount();

  //   const { sessionId /*, error*/ } = await sendTransactions({
  //     transactions: validateTransaction,
  //     transactionsDisplayInfo: {
  //       processingMessage: 'Processing Validation',
  //       errorMessage: 'An error has occured during Validation',
  //       successMessage: 'Participant Validation Successful'
  //     },
  //     redirectAfterSign: false
  //   });
  //   if (sessionId != null) {
  //     setTransactionSessionId(sessionId);
  //   }
  // };

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

  // const cancelEvent = async (arg1: string) => {
  //   const cancelEventTransaction = {
  //     value: '0',
  //     data: 'cancel_event' + '@' + arg1,
  //     receiver: contractAddress,
  //     gasLimit: '600000000'
  //   };
  //   await refreshAccount();

  //   const { sessionId /*, error*/ } = await sendTransactions({
  //     transactions: cancelEventTransaction,
  //     transactionsDisplayInfo: {
  //       processingMessage: 'Finishing Event',
  //       errorMessage: 'An error has occured while canceling the event',
  //       successMessage: 'Event Canceled Successfully'
  //     },
  //     redirectAfterSign: false
  //   });
  //   if (sessionId != null) {
  //     setTransactionSessionId(sessionId);
  //   }
  // };

  // const Refund = async (arg1: string) => {
  //   // const c_address = Address.fromBech32(contractAddress);
  //   // const refundTransaction = {
  //   //   sender: 'erd17634f97cgpvh7qqgtg2gvz9w95n75ytmhj9kf4rnt4r5wd3xfgdq049xwu',
  //   //   value: '0',
  //   //   data:
  //   //     'ESDTNFTTransfer' +
  //   //     '@' +
  //   //     '5453542d303630383330' +
  //   //     '@' +
  //   //     '0a' +
  //   //     '@' +
  //   //     '01' +
  //   //     '@' +
  //   //     c_address +
  //   //     '@' +
  //   //     '726566756e64' +
  //   //     '@' +
  //   //     arg1,

  //   //   receiver:
  //   //     'erd17634f97cgpvh7qqgtg2gvz9w95n75ytmhj9kf4rnt4r5wd3xfgdq049xwu',
  //   //   gasLimit: '600000000'
  //   // };
  //   const refundTransaction = {
  //     value: '0',
  //     data: 'refund' + '@' + arg1,
  //     receiver: contractAddress,
  //     gasLimit: '600000000'
  //   };
  //   await refreshAccount();

  //   const { sessionId /*, error*/ } = await sendTransactions({
  //     transactions: refundTransaction,
  //     transactionsDisplayInfo: {
  //       processingMessage: 'processing Refund',
  //       errorMessage: 'An error has occured while processing the refund',
  //       successMessage: 'Ticket Refunded Successfully'
  //     },
  //     redirectAfterSign: false
  //   });
  //   if (sessionId != null) {
  //     setTransactionSessionId(sessionId);
  //   }
  // };

  return (
    <div className='d-flex mt-4 justify-content-center'>
      <div className='p-1 action-btn'>
        <button onClick={openFirstModal}>
          <FontAwesomeIcon icon={faTicketSimple} className='text-primary' />
        </button>
        <CreateVoteModal
          isOpen={isFirstModalOpen}
          onClose={closeFirstModal}
          onCreateVote={createVote}
        />
        <a href='/' className='text-white text-decoration-none'>
          Create Vote
        </a>
      </div>
      <div className='p-1 action-btn'>
        <button onClick={openSecondModal}>
          <FontAwesomeIcon icon={faPlus} className='text-primary' />
        </button>
        <VoteModal
          isOpen={isSecondModalOpen}
          onClose={closeSecondModal}
          onVote={Vote}
        />
        <a href='/' className='text-white text-decoration-none'>
          Vote
        </a>
      </div>
      <div className='p-1 action-btn'>
        <button onClick={openThirdModal}>
          <FontAwesomeIcon icon={faUserCheck} className='text-primary' />
        </button>
        <ResultModal
          isOpen={isThirdModalOpen}
          onClose={closeThirdModal}
          onResult={Result}
        />
        <a href='/' className='text-white text-decoration-none'>
          Get Result
        </a>
      </div>
    </div>
  );
};
