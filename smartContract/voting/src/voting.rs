


#![no_std]

multiversx_sc::imports!();
#[multiversx_sc::contract]
pub trait Voting {
    #[init]
    fn init(&self, voting_deadline: u64, no_of_options: u64) {
        self.deadline().set(voting_deadline);
        self.number_of_options().set(no_of_options);
        for _i in 1..=no_of_options{
           self.voting_status().push(&no_of_options); 
        }
    }

    /// Func pentru setarea numelui pentru votul valorilor
    #[only_owner]
    #[endpoint]
    fn set_values(&self) {
        let nu_bytes: &[u8; 2] = &[b'n', b'u'];
        self.names().push(nu_bytes);
        let da_bytes: &[u8; 2] = &[b'd', b'a'];
        self.names().push(da_bytes);


    }

    /// Func pentru votare - ar trebui sa verifice dac persoana a votat deja
    #[endpoint]
    fn vote(&self){}
    





    // funct for getting the result only after the voting aka deadline is done
    #[endpoint]
    fn calculate_result(&self){}

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
    fn names(&self) -> VecMapper<[u8; 2]>;


    // returns participants that voted
    #[view(getParticipants)]
    #[storage_mapper("participants")]
    fn participants(&self) -> UnorderedSetMapper<ManagedAddress>;


    // returns voting status
    #[view(getStatus)]
    #[storage_mapper("voting_status")]
    fn voting_status(&self) -> VecMapper<u64>;
}

