#![no_std]

multiversx_sc::imports!();
#[multiversx_sc::contract]

pub trait Voting {
    #[init]
    fn init(&self, voting_deadline: u64, no_of_options: u64) {
        let round = self.blockchain().get_block_round();
        self.deadline().set(voting_deadline + round);
        self.number_of_options().set(no_of_options);
        for _i in 1..(1 + no_of_options){
           self.voting_status().push_back(0); 
        }
    }
    
    #[endpoint]
    fn upgrade(&self, _voting_deadline: u64, _no_of_options: u64){}

    /// Func pentru setarea numelui pentru votul valorilor
    #[only_owner]
    #[endpoint]
    fn set_values(&self) {

    }

    /// Func pentru votare - ar trebui sa verifice dac persoana a votat deja
    #[endpoint]
    fn vote(&self, voting_value: u64){
        let caller = self.blockchain().get_caller();
        require!(!self.participants().contains(&caller), "You have already voted!");
        //check deadline
        let round = self.blockchain().get_block_round();
        let ddl = self.deadline().get();
        require!(ddl > round , "Voting closed, ddl reached!");
        require!(self.number_of_options().get() >= voting_value , "Voting number too high!");
        require!(voting_value > 0 , "Voting number too low!");
        let original_value = self.voting_status().get_node_by_id(voting_value as u32);
        match original_value {
            Some(node) => {
                let v = node.into_value();
                self.voting_status().set_node_value_by_id(voting_value as u32, v + 1);
            }
            None => {}
        }
        
        self.participants().insert(caller);
    }
    

    // funct for getting the result only after the voting aka deadline is done. de adaugat daca
    // la final exista 2 max-uri
    #[endpoint]
    fn calculate_result(&self){
        let round = self.blockchain().get_block_round();
        let ddl = self.deadline().get();
        require!(ddl < round , "Voting still going!");


    }
    
    // resets the voting app
    // 
    #[only_owner]
    #[endpoint]
    fn reset_vote(&self, voting_deadline: u64, no_of_options: u64) {
        
        self.deadline().set(voting_deadline);
        self.number_of_options().set(no_of_options);
        self.participants().clear();
        self.voting_status().clear();
        self.names().clear();


    }


    // returns the deadline date
    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;


    // returns how many options there are 
    #[view(getNumberOfOptions)]
    #[storage_mapper("number_of_options")]
    fn number_of_options(&self) -> SingleValueMapper<u64>;


    // returns the options names
    #[view(getNames)]
    #[storage_mapper("names")]
    fn names(&self) -> VecMapper<u8>;


    // returns participants that voted
    #[view(getParticipants)]
    #[storage_mapper("participants")]
    fn participants(&self) -> UnorderedSetMapper<ManagedAddress>;


    // returns voting status
    #[view(getStatus)]
    #[storage_mapper("voting_status")]
    fn voting_status(&self) -> LinkedListMapper<u64>;

    #[view(getResult)]
    #[storage_mapper("result")]
    fn result(&self) -> SingleValueMapper<u64>;
}

