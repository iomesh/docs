---
id: introduction
title: Introduction 
sidebar_label: Introduction
---

## What is IOMesh?

IOMesh is a Kubernetes-native storage system that manages storage resources within a Kubernetes cluster, automates operations and maintenance, and provides various types of persistent storage, data protection and migration capabilities for data applications such as MySQL, Cassandra, MongoDB and middleware running on Kubernetes.

## Key Features 

**Kubernetes Native**

IOMesh is fully built on the capabilities of Kubernetes and implements storage as code through declarative APIs, allowing for managing infrastructure and deployment environments through code to better support DevOps.

**High Performance** 

IOMesh enables I/O-intensive databases and applications to run efficiently in the container environment. Leveraging I/O localization and tiered storage, IOMesh achieves high IOPS in kubernetes storage performance tests while maintaining extremely low latency, ensuring stable adoption of data applications.

**No Kernel Dependencies** 
   
Running separately in user space instead of kernel space, IOMesh is isolated from other applications on the same node, which means that when IOMesh fails, other applications can deliver services as usual without causing the entire system to fail. Since IOMesh is kernel independent, you do not need to install any kernel modules or worry about kernel version compatibility issues.

**Data Protection & Security**

A system with multiple levels of data protection makes sure that data is always secure and available. Multiple-replica mechanism ensures data redundancy as expected at all times with concurrent data recovery from multiple nodes in the event of a failure; PV-level snapshot capability quickly restores data to the state at the time of the snapshot; the system can automatically detect and isolate abnormal hard disks, reducing the impact on system performance and easing the workload of operations and maintenance; authentication is created for specific PVs, and the correct credentials must be provided to access the relevant PVs, ensuring data security.


IOMesh does this by implementing multiple replicas 




IOMesh does this by placing number of replicas across nodes, allowing for PV-level snapshots for easy recovery in case of trouble, while also isolating abnormal disks to reduce impact to the minimum. 

**Fully Integrated into Kubernetes Ecosystem**

Provisioning storage through CSI, IOMesh supports migration of stateful applications across nodes or clusters. It is seamlessly integrated with Kubernetes tool chains, using Helm Chart to provide simple deployment and supports monitoring IOMesh storage with Prometheus and Grafana


cross-node or cross-cluster migration of stateful applications. It is seamlessly integrated with Kubernetes-related tool chains, provides a simple and efficient installation and deployment experience using Helm Chart; it supports interfaces with Prometheus and Grafana, standardizing processes related to monitoring and alerting and data visualization.


## Architecture
![IOMesh arch](https://user-images.githubusercontent.com/78140947/122766241-e2352c00-d2d3-11eb-9630-bb5b428c3178.png)
