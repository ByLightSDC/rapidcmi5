// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Tooltip,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   TextField,
//   Paper,
// } from '@mui/material';
// import { createStyles, makeStyles, Theme } from '@mui/material/styles';
// import { selectInit, setServices } from "../appSlice";
// import {
//   selectGoodToClose,
//   selectRequestProcessing,
//   setGoodToClose,
// } from "./headerSlice";
// import CachedIcon from '@mui/material/icons/Cached';
// import { wsClient } from "../websocket/websocket";
// import AddIcon from '@mui/material/icons/Add';
// import ToggleButton from "@material-ui/lab/ToggleButton";
// import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
// import { RSMap } from "./RSMap";
// import { countryCodes } from "./country-codes";
// import { setSnackStatus } from "../snack/snackSlice";

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     flexContainer: {
//       display: "flex",
//     },
//     flexNone: {
//       flex: "none",
//     },
//     flex: {
//       flexGrow: 1,
//     },
//     appBar: {
//       background: theme.palette.grey[700],
//     },
//     toolbar: {
//       paddingLeft: "12px",
//       paddingRight: "8px",
//     },
//     chip: {
//       color: "white",
//       maxWidth: "20rem",
//       overflow: "hidden",
//     },
//     boxText: {
//       color: theme.palette.grey[300],
//     },
//     boxColor: {
//       backgroundColor: theme.palette.grey[800],
//     },
//     boxSpacing: {
//       marginRight: "20px",
//     },
//     firstBoxSpacing: {
//       marginLeft: "20px",
//     },
//     paddingFix: {
//       paddingLeft: "0px",
//     },
//   })
// );

// const useStylesAdd = makeStyles((theme: Theme) =>
//   createStyles({
//     dialog: {
//       width: "100%",
//       height: "100%",
//     },
//     buttonDiv: {
//       display: "flex",
//     },
//     button: {
//       flex: "auto",
//       borderRadius: 0,
//     },
//     apply: {
//       backgroundColor: theme.palette.success.main,
//     },
//     cancel: {
//       backgroundColor: theme.palette.error.main,
//     },
//     textField: {
//       overflow: "visible",
//     },
//     paper: {
//       paddingTop: ".25rem",
//       paddingBottom: ".25rem",
//       paddingLeft: ".25rem",
//       paddingRight: ".25rem",
//     },
//     wide: {
//       width: "100%",
//     },
//   })
// );

// function Add() {
//   const requestProcessing = useSelector(selectRequestProcessing);
//   const classes = useStylesAdd();
//   const [open, setOpen] = useState(false);
//   const dispatch = useDispatch();
//   const goodToClose = useSelector(selectGoodToClose);
//   const handleClickOpen = () => {
//     setOpen(true);
//   };
//   const handleClose = () => {
//     setOpen(false);
//   };

//   useEffect(() => {
//     if (goodToClose) {
//       handleClose();
//       dispatch(setGoodToClose({ goodToClose: false }));
//     }
//   }, [goodToClose, dispatch]);

//   // Form States
//   const [service, setService] = useState("diaspora");
//   const [url, setUrl] = useState("");
//   const [cname, setCname] = useState("");
//   const [ipAssignment, setIpAssignment] = useState("ip");
//   const [ip, setIp] = useState("");
//   const [subnet, setSubnet] = useState("");
//   const [lat, setLat] = useState(0);
//   const [long, setLong] = useState(0);
//   const [country, setCountry] = useState("US");
//   const [ftpUsername, setFtpUsername] = useState("");
//   const [ftpPassword, setFtpPassword] = useState("");
//   const [ntpStratum, setNtpStratum] = useState(0);
//   const [tor, setTor] = useState("DA");

//   const [nginxRedir, setNginxRedir] = useState("");
//   const [nginxDecoy, setNginxDecoy] = useState("");
//   const [nginxRedirPath, setNginxRedirPath] = useState("");

//   const [haRedir, setHaRedir] = useState("");
//   const [haDecoy, setHaDecoy] = useState("");
//   const [haRedirPath, setHaRedirPath] = useState("");
//   const [haRedirPathReg, setHaRedirPathReg] = useState("");
//   const [haC2Port, setHaC2Port] = useState("");
//   const [haSslC2Port, setHaSslC2Port] = useState("");
//   const [haDecoyPort, setHaDecoyPort] = useState("");
//   const [haSslDecoyPort, setHaSslDecoyPort] = useState("");

//   const [haOpts, setHaOpts] = useState<Array<string>>(["http"]);
//   const [nginxOpts, setNginxOpts] = useState<Array<string>>(["http"]);
//   const [logging, setLogging] = useState<string | null>(null);

//   function apply() {
//     if (service === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must pick a service",
//           },
//         })
//       );
//       return;
//     }
//     if (url === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify a URL",
//           },
//         })
//       );
//       return;
//     }
//     if (ipAssignment === "ip" && ip === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify an IP",
//           },
//         })
//       );
//       return;
//     }
//     if (ipAssignment === "subnet" && subnet === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify an subnet",
//           },
//         })
//       );
//       return;
//     }
//     if (ipAssignment === "map" && (isNaN(lat) || isNaN(long))) {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify Lat/Long",
//           },
//         })
//       );
//       return;
//     }
//     if (ipAssignment === "country" && country === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify country",
//           },
//         })
//       );
//       return;
//     }
//     // ENV
//     if (service === "ftpd" && (ftpUsername === "" || ftpPassword === "")) {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify a FTP user/pass",
//           },
//         })
//       );
//       return;
//     }
//     if (service === "ntpd" && isNaN(ntpStratum)) {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify a NTP stratum",
//           },
//         })
//       );
//       return;
//     }
//     if (service === "tor" && tor === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify a TOR type",
//           },
//         })
//       );
//       return;
//     }
//     if (service === "haproxy-redirector-simple" && haRedir === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify a domain for redirection",
//           },
//         })
//       );
//       return;
//     }
//     if (service === "nginx-redirector-simple" && nginxRedir === "") {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify a domain for redirection",
//           },
//         })
//       );
//       return;
//     }
//     if (
//       service === "haproxy-redirector-advanced" &&
//       (haRedir === "" ||
//         haDecoy === "" ||
//         haRedirPath === "" ||
//         haRedirPathReg === "" ||
//         haC2Port === "" ||
//         haSslC2Port === "" ||
//         haDecoyPort === "" ||
//         haSslDecoyPort === "")
//     ) {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify all pod configurations",
//           },
//         })
//       );
//       return;
//     }
//     if (
//       service === "nginx-redirector-advanced" &&
//       (nginxRedir === "" || nginxDecoy === "" || nginxRedirPath === "")
//     ) {
//       dispatch(
//         setSnackStatus({
//           snackStatus: {
//             open: true,
//             severity: "error",
//             message: "You must specify all pod configurations",
//           },
//         })
//       );
//       return;
//     }

//     let message: any = {};
//     // IMAGE
//     message.image = service;
//     if (
//       service === "haproxy-redirector-simple" ||
//       service === "haproxy-redirector-advanced"
//     ) {
//       message.image = "haproxy-redirector";
//     }
//     if (
//       service === "nginx-redirector-simple" ||
//       service === "nginx-redirector-advanced"
//     ) {
//       message.image = "nginx-redirector";
//     }
//     // ALL REQUESTS
//     message.dns = url;
//     message.cname = cname;
//     // IP METHODS
//     if (ipAssignment === "ip") {
//       message.ip = ip;
//     }
//     if (ipAssignment === "subnet") {
//       message.subnet = subnet;
//     }
//     if (ipAssignment === "map") {
//       message.latitude = lat;
//       message.longitude = long;
//     }
//     if (ipAssignment === "country") {
//       message.country = country;
//     }
//     // ENVS
//     message.var = {};
//     if (service === "ftpd") {
//       message.var.FTP_USER_NAME = ftpUsername;
//       message.var.FTP_USER_PASS = ftpPassword;
//     }
//     if (service === "ntpd") {
//       message.var.STRATUM = ntpStratum;
//     }
//     if (service === "tor") {
//       message.var.ROLE = tor;
//     }
//     if (service === "haproxy-redirector-simple") {
//       message.var.REDIR = haRedir;
//     }
//     if (service === "nginx-redirector-simple") {
//       message.var.REDIR = nginxRedir;
//     }
//     if (service === "haproxy-redirector-advanced") {
//       message.var.REDIR = haRedir;
//       message.var.DECOY = haDecoy;
//       message.var.REDIR_PATH = haRedirPath;
//       message.var.REDIR_PATH_REG = haRedirPathReg;
//       message.var.C2_PORT = haC2Port;
//       message.var.SSL_C2_PORT = haSslC2Port;
//       message.var.DECOY_PORT = haDecoyPort;
//       message.var.DECOY_SSL_PORT = haSslDecoyPort;
//     }
//     if (service === "nginx-redirector-advanced") {
//       message.var.REDIR = nginxRedir;
//       message.var.DECOY = nginxDecoy;
//       message.var.REDIR_PATH = nginxRedirPath;
//     }
//     // Additional proxy opts
//     if (
//       service === "haproxy-redirector-simple" ||
//       service === "haproxy-redirector-advanced"
//     ) {
//       message.var.PROTOCOL = haOpts.join(",");
//     }

//     if (
//       service === "nginx-redirector-simple" ||
//       service === "nginx-redirector-advanced"
//     ) {
//       message.var.PROTOCOL = nginxOpts.join(",");
//     }

//     if (
//       service === "haproxy-redirector-simple" ||
//       service === "haproxy-redirector-advanced" ||
//       service === "nginx-redirector-simple" ||
//       service === "nginx-redirector-advanced"
//     ) {
//       message.logging = logging !== null ? "true" : "false";
//     }

//     wsClient.getCreate(message);
//   }

//   function getEnvChunk() {
//     const hasEnv =
//       service === "ftpd" ||
//       service === "ntpd" ||
//       service === "tor" ||
//       service === "haproxy-redirector-simple" ||
//       service === "haproxy-redirector-advanced" ||
//       service === "nginx-redirector-simple" ||
//       service === "nginx-redirector-advanced";
//     return (
//       <>
//         {hasEnv && (
//           <>
//             <Paper elevation={3} className={classes.paper}>
//               <Typography align="center">Pod Configuration</Typography>
//               <br />
//               {service === "ftpd" && (
//                 <>
//                   <TextField
//                     fullWidth
//                     label="FTP Username"
//                     variant="outlined"
//                     value={ftpUsername}
//                     onChange={(e) => setFtpUsername(e.target.value as string)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="FTP Password"
//                     variant="outlined"
//                     value={ftpPassword}
//                     onChange={(e) => setFtpPassword(e.target.value as string)}
//                     className={classes.textField}
//                   />
//                 </>
//               )}
//               {service === "ntpd" && (
//                 <>
//                   <TextField
//                     type="number"
//                     fullWidth
//                     label="NTP Stratum"
//                     variant="outlined"
//                     value={ntpStratum}
//                     onChange={(e) => setNtpStratum(parseInt(e.target.value))}
//                     className={classes.textField}
//                   />
//                 </>
//               )}
//               {service === "tor" && (
//                 <>
//                   <FormControl fullWidth>
//                     <InputLabel>Node Type</InputLabel>
//                     <Select
//                       value={tor}
//                       onChange={(e) => setTor(e.target.value as string)}
//                     >
//                       <MenuItem value="DA">Domain Authority</MenuItem>
//                       <MenuItem value="RELAY">Relay</MenuItem>
//                       <MenuItem value="EXIT">Exit</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </>
//               )}
//               {service === "haproxy-redirector-simple" && (
//                 <>
//                   <TextField
//                     fullWidth
//                     label="REDIR"
//                     variant="outlined"
//                     value={haRedir}
//                     onChange={(e) => setHaRedir(e.target.value)}
//                     className={classes.textField}
//                   />
//                 </>
//               )}
//               {service === "nginx-redirector-simple" && (
//                 <>
//                   <TextField
//                     fullWidth
//                     label="REDIR"
//                     variant="outlined"
//                     value={nginxRedir}
//                     onChange={(e) => setNginxRedir(e.target.value)}
//                     className={classes.textField}
//                   />
//                 </>
//               )}
//               {service === "haproxy-redirector-advanced" && (
//                 <>
//                   <TextField
//                     fullWidth
//                     label="REDIR"
//                     variant="outlined"
//                     value={haRedir}
//                     onChange={(e) => setHaRedir(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="DECOY"
//                     variant="outlined"
//                     value={haDecoy}
//                     onChange={(e) => setHaDecoy(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="REDIR_PATH"
//                     variant="outlined"
//                     value={haRedirPath}
//                     onChange={(e) => setHaRedirPath(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="REDIR_PATH_REG"
//                     variant="outlined"
//                     value={haRedirPathReg}
//                     onChange={(e) => setHaRedirPathReg(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="C2_PORT"
//                     variant="outlined"
//                     value={haC2Port}
//                     onChange={(e) => setHaC2Port(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="SSL_C2_PORT"
//                     variant="outlined"
//                     value={haSslC2Port}
//                     onChange={(e) => setHaSslC2Port(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="DECOY_PORT"
//                     variant="outlined"
//                     value={haDecoyPort}
//                     onChange={(e) => setHaDecoyPort(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="DECOY_SSL_PORT"
//                     variant="outlined"
//                     value={haSslDecoyPort}
//                     onChange={(e) => setHaSslDecoyPort(e.target.value)}
//                     className={classes.textField}
//                   />
//                 </>
//               )}
//               {service === "nginx-redirector-advanced" && (
//                 <>
//                   <TextField
//                     fullWidth
//                     label="REDIR"
//                     variant="outlined"
//                     value={nginxRedir}
//                     onChange={(e) => setNginxRedir(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="DECOY"
//                     variant="outlined"
//                     value={nginxDecoy}
//                     onChange={(e) => setNginxDecoy(e.target.value)}
//                     className={classes.textField}
//                   />
//                   <br />
//                   <br />
//                   <TextField
//                     fullWidth
//                     label="REDIR_PATH"
//                     variant="outlined"
//                     value={nginxRedirPath}
//                     onChange={(e) => setNginxRedirPath(e.target.value)}
//                     className={classes.textField}
//                   />
//                 </>
//               )}
//             </Paper>
//             <br />
//             <br />
//           </>
//         )}
//         {!hasEnv && null}
//       </>
//     );
//   }

//   function getOptsChunk() {
//     const hasEnv =
//       service === "haproxy-redirector-simple" ||
//       service === "haproxy-redirector-advanced" ||
//       service === "nginx-redirector-simple" ||
//       service === "nginx-redirector-advanced";
//     return (
//       <>
//         {hasEnv && (
//           <>
//             <Paper elevation={3} className={classes.paper}>
//               <Typography align="center">Proxy Configuration</Typography>
//               <br />
//               {(service === "haproxy-redirector-simple" ||
//                 service === "haproxy-redirector-advanced") && (
//                 <>
//                   <ToggleButtonGroup
//                     exclusive={false}
//                     className={classes.buttonDiv}
//                     value={haOpts}
//                     onChange={(e, v) => {
//                       setHaOpts(v);
//                     }}
//                   >
//                     <ToggleButton className={classes.button} value="http">
//                       <Typography>Enable HTTP Service</Typography>
//                     </ToggleButton>
//                     <ToggleButton className={classes.button} value="https">
//                       <Typography>Enable HTTPS Service</Typography>
//                     </ToggleButton>
//                   </ToggleButtonGroup>
//                   <ToggleButtonGroup
//                     exclusive
//                     className={classes.buttonDiv}
//                     value={logging}
//                     onChange={(e, v) => {
//                       setLogging(v);
//                     }}
//                   >
//                     <ToggleButton className={classes.button} value="enabled">
//                       <Typography>Enable Redirection Logging</Typography>
//                     </ToggleButton>
//                   </ToggleButtonGroup>
//                 </>
//               )}
//               {(service === "nginx-redirector-simple" ||
//                 service === "nginx-redirector-advanced") && (
//                 <>
//                   <ToggleButtonGroup
//                     exclusive={false}
//                     className={classes.buttonDiv}
//                     value={nginxOpts}
//                     onChange={(e, v) => {
//                       setNginxOpts(v);
//                     }}
//                   >
//                     <ToggleButton className={classes.button} value="http">
//                       <Typography>Enable HTTP Service</Typography>
//                     </ToggleButton>
//                     <ToggleButton className={classes.button} value="https">
//                       <Typography>Enable HTTPS Service</Typography>
//                     </ToggleButton>
//                     <ToggleButton className={classes.button} value="dns">
//                       <Typography>Enable DNS Service</Typography>
//                     </ToggleButton>
//                   </ToggleButtonGroup>
//                   <ToggleButtonGroup
//                     exclusive
//                     className={classes.buttonDiv}
//                     value={logging}
//                     onChange={(e, v) => {
//                       setLogging(v);
//                     }}
//                   >
//                     <ToggleButton className={classes.button} value="enabled">
//                       <Typography>Enable Redirection Logging</Typography>
//                     </ToggleButton>
//                   </ToggleButtonGroup>
//                 </>
//               )}
//             </Paper>
//             <br />
//             <br />
//           </>
//         )}
//         {!hasEnv && null}
//       </>
//     );
//   }

//   return (
//     <>
//       <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
//         <DialogTitle id="customized-dialog-title" className={classes.dialog}>
//           Create a service:
//         </DialogTitle>
//         <DialogContent dividers>
//           <FormControl fullWidth>
//             <InputLabel>Service</InputLabel>
//             <Select
//               value={service}
//               onChange={(e) => setService(e.target.value as string)}
//             >
//               <MenuItem value="diaspora">Diaspora (Social Media)</MenuItem>
//               <MenuItem value="ftpd">FTP Server</MenuItem>
//               <MenuItem value="haproxy-redirector-simple">
//                 HA Proxy Simple
//               </MenuItem>
//               <MenuItem value="haproxy-redirector-advanced">
//                 HA Proxy Advanced
//               </MenuItem>
//               <MenuItem value="ircd">IRC Server</MenuItem>
//               <MenuItem value="mastodon">Mastodon (Social Media)</MenuItem>
//               <MenuItem value="nextcloud">Nextcloud (~Dropbox)</MenuItem>
//               <MenuItem value="ntpd">NTP Server</MenuItem>
//               <MenuItem value="privatebin">Privatebin (Pastebin)</MenuItem>
//               <MenuItem value="nginx-redirector-simple">
//                 NGINX Proxy Simple
//               </MenuItem>
//               <MenuItem value="nginx-redirector-advanced">
//                 NGINX Proxy Advanced
//               </MenuItem>
//               <MenuItem value="yacy-search">Yacy Search (Google)</MenuItem>
//               <MenuItem value="smtp">SMTP Server</MenuItem>
//               <MenuItem value="tor">Tor Node</MenuItem>
//               <MenuItem value="mailu">Mailu (Webmail)</MenuItem>
//               <MenuItem value="wordpress">Wordpress</MenuItem>
//             </Select>
//           </FormControl>
//           <br />
//           <br />
//           <TextField
//             fullWidth
//             label="URL"
//             variant="outlined"
//             value={url}
//             onChange={(e) => setUrl(e.target.value as string)}
//             className={classes.textField}
//           />
//           <br />
//           <br />
//           <TextField
//             fullWidth
//             label="CNAME"
//             variant="outlined"
//             value={cname}
//             onChange={(e) => setCname(e.target.value as string)}
//             className={classes.textField}
//           />
//           <br />
//           <br />
//           {getEnvChunk()}
//           {getOptsChunk()}
//           <Paper elevation={3} className={classes.paper}>
//             <Typography align="center">Ip Assignment</Typography>
//             <br />
//             <ToggleButtonGroup
//               className={classes.buttonDiv}
//               value={ipAssignment}
//               exclusive
//               onChange={(e, v) => {
//                 if (v !== null) setIpAssignment(v);
//               }}
//             >
//               <ToggleButton className={classes.button} value="ip">
//                 <Typography>IP</Typography>
//               </ToggleButton>
//               <ToggleButton className={classes.button} value="subnet">
//                 <Typography>SUBNET</Typography>
//               </ToggleButton>
//               <ToggleButton className={classes.button} value="map">
//                 <Typography>MAP</Typography>
//               </ToggleButton>
//               <ToggleButton className={classes.button} value="country">
//                 <Typography>COUNTRY</Typography>
//               </ToggleButton>
//             </ToggleButtonGroup>
//             <br />
//             {ipAssignment === "ip" && (
//               <TextField
//                 fullWidth
//                 label="IP"
//                 variant="outlined"
//                 value={ip}
//                 onChange={(e) => setIp(e.target.value as string)}
//                 className={classes.textField}
//               />
//             )}
//             {ipAssignment === "subnet" && (
//               <TextField
//                 fullWidth
//                 label="Subnet"
//                 variant="outlined"
//                 value={subnet}
//                 onChange={(e) => setSubnet(e.target.value as string)}
//                 className={classes.textField}
//               />
//             )}
//             {ipAssignment === "map" && (
//               <>
//                 <div className={`${classes.buttonDiv} ${classes.textField}`}>
//                   <TextField
//                     fullWidth
//                     label="Latitude"
//                     type="number"
//                     variant="outlined"
//                     value={lat}
//                     onChange={(e) => setLat(parseInt(e.target.value))}
//                     className={`${classes.textField}`}
//                     style={{ marginRight: ".25rem" }}
//                   />
//                   <TextField
//                     fullWidth
//                     label="Longitude"
//                     type="number"
//                     variant="outlined"
//                     value={long}
//                     onChange={(e) => setLong(parseInt(e.target.value))}
//                     className={`${classes.textField}`}
//                     style={{ marginLeft: ".25rem" }}
//                   />
//                 </div>
//                 <br />
//                 <RSMap lat={lat} lon={long} />
//               </>
//             )}
//             {ipAssignment === "country" && (
//               <FormControl fullWidth>
//                 <InputLabel>Country</InputLabel>
//                 <Select
//                   value={country}
//                   onChange={(e) => setCountry(e.target.value as string)}
//                 >
//                   {countryCodes.map((countryCode) => {
//                     return (
//                       <MenuItem value={countryCode.value}>
//                         {countryCode.label}
//                       </MenuItem>
//                     );
//                   })}
//                 </Select>
//               </FormControl>
//             )}
//           </Paper>
//         </DialogContent>
//         <div className={classes.buttonDiv}>
//           <Button
//             className={`${classes.button} ${classes.cancel}`}
//             disabled={requestProcessing}
//             onClick={handleClose}
//           >
//             Cancel
//           </Button>
//           <Button
//             className={`${classes.button} ${classes.apply}`}
//             disabled={requestProcessing}
//             onClick={apply}
//           >
//             Apply
//           </Button>
//         </div>
//       </Dialog>
//       <IconButton onClick={handleClickOpen}>
//         <AddIcon />
//       </IconButton>
//     </>
//   );
// }

// export default function Map() {
//   const classes = useStyles();
//   const init = useSelector(selectInit);
//   const requestProcessing = useSelector(selectRequestProcessing);
//   return (
//     <>
//       <AppBar className={`${classes.appBar}`} position="static">
//         <Toolbar
//           variant="dense"
//           className={`${classes.toolbar} ${classes.flexContainer}`}
//         >
//           <Typography variant="h6" noWrap={true} className={classes.flexNone}>
//             Grey Space Manager
//           </Typography>
//           <span className={classes.flex} />
//           <Tooltip title="Event Information">
//             <Chip
//               label={init.eventName}
//               className={`${classes.chip} ${classes.boxColor} ${classes.boxSpacing} ${classes.firstBoxSpacing}`}
//             />
//           </Tooltip>
//           <Tooltip title="Deployment Information">
//             <Chip
//               label={init.deploymentName}
//               className={`${classes.chip} ${classes.boxColor} ${classes.boxSpacing}`}
//             />
//           </Tooltip>
//           <Add />
//           <IconButton
//             onClick={() => wsClient.getServices()}
//             disabled={requestProcessing}
//           >
//             <CachedIcon />
//           </IconButton>
//         </Toolbar>
//       </AppBar>
//     </>
//   );
// }
