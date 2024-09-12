import { useEffect, useState, useRef } from "react";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { CSVLink } from 'react-csv';


export interface User {
    id: number;
    name: string;
    email: string;
    street: string;
    city: string;
    zipcode: string;
    phone: string;
    status: string;
    errors: {[key: string]: Errors};
}

export interface CsvUser {
    id: number;
    name: string;
    email: string;
    street: string;
    city: string;
    zipcode: string;
    phone: string;
    status: string;
    errors: string;
}

export interface Errors {
    message: string;
    severity: string;
}

export default function DataReviewTable() {

    data: Array<User> 
    const [data, setData] = useState<Array<User>>([]);
    const [csvData, setCsvData] = useState<Array<CsvUser>>([]);


    useEffect(() => {
        const pathname = window.location.href;
        fetch(pathname + 'api/data')
            .then(response => response.json())
            .then(json => setData(json.records))
            .catch(error => console.error(error));
    }, []);

    useEffect(() => {
        const updatedUsers = data.map((user) => ({
            ...user,
            errors: user.errors ? Object.values(user.errors).map((error) => 
                `${error.message} (${error.severity})`).join(', ') : '',
          }));
        setCsvData(updatedUsers)
    }, [data]);

    function setSeverity(user: User, field: string) {
        if (field in user.errors) {
            if (user.errors[field].severity === "warning") {
                return "table-warning"
            }
            else {
                return "table-danger"
            }
        }
        else {
            return "table-success"
        }
    }

    interface CustomPopoverProps {
        user: User;
        field: string;
      }

    const CustomPopover = ({ user, field }: CustomPopoverProps) => {
        const [showPopover, setShowPopover] = useState(false);
        const [hovered, setHovered] = useState(false);
        const overlayTriggerRef = useRef<typeof OverlayTrigger>(null);

      
        const value = user[field as keyof User] as string | number;


        useEffect(() => {
            let timer: NodeJS.Timeout;
            if (hovered) {
              timer = setTimeout(() => {
                setShowPopover(true);
                if (overlayTriggerRef.current) {
                //   overlayTriggerRef.current.update();
                }
              }, 250); 
            } else {
              setShowPopover(false);
            }
        
            return () => clearTimeout(timer);
          }, [hovered]);

        if (field in user.errors) {
          return (
            <OverlayTrigger placement="top" show={showPopover} overlay={
            <Popover id="popover-basic">
              <Popover.Header as="h3">Error Message</Popover.Header>
              <Popover.Body>
                {user.errors[field].message}
              </Popover.Body>
            </Popover>}>
            <td className={setSeverity(user, field)}         
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}>{value}</td>
            </OverlayTrigger>
          );
        } else {
            return <td className={setSeverity(user, "id")}>{value}</td>;
        }
      };

      interface ModalProps {
        user: User;
      }

      const ModalButton = ({ user }: ModalProps) => {
        const [show, setShow] = useState(false);
      
        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);
      
        return (
            <>

            <img src="/assets/popout.png" className="popout-button" alt="popout button" onClick={handleShow} />
    
            
      
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Error Summary for {user.name}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
              <ul>
                {user.errors && Object.entries(user.errors).map(([, error], index) => (
                    <li key={index}>
                        <strong>{error.severity === "warning" ? "Warning" : "Critical"}</strong>: {error.message}
                    </li>
                ))}
                </ul>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
            </>
        );
      }

    return (
        <div style={{ margin: "20px" }}>
            <div className='row'>
            <h1 className="fs-1 fw-bold col-10">Data Review</h1>
            <CSVLink className="col-2 fs-4 text-decoration-underline" data={csvData} filename={'dashboardData.csv'}>
                Download CSV
            </CSVLink>
            </div>
            {data ? 
                <div className="table-div">

                    <table className='table table-bordered'>
                        <thead className='table-dark'>
                            <tr>
                                <th>Id</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Street</th>
                                <th>City</th>
                                <th>Zipcode</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Errors</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map((user, index) => {
                                    return <tr key={index}>
                                        <CustomPopover user={user} field="id"></CustomPopover>
                                        <CustomPopover user={user} field="name"></CustomPopover>
                                        <CustomPopover user={user} field="email"></CustomPopover>
                                        <CustomPopover user={user} field="street"></CustomPopover>
                                        <CustomPopover user={user} field="city"></CustomPopover>
                                        <CustomPopover user={user} field="zipcode"></CustomPopover>
                                        <CustomPopover user={user} field="phone"></CustomPopover>
                                        <CustomPopover user={user} field="status"></CustomPopover>
                                        <td><ModalButton user={user}></ModalButton></td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            : 'Loading...'
            }
        </div>
    );
}
