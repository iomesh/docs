---
id: install-iomesh
title: Install IOMesh
sidebar_label: Install IOMesh
---

## Quick Installation Guide

For quick installation, run the corresponding script below according to your OS distribution.

> **_NOTE_: Helm3 will be installed automatically if it is not found.**

<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL7/CentOS7-->

```shell
# Every node running IOMesh must have an IP address belonging to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el7.sh | sh -
```

<!--RHEL8/CentOS8/CoreOS-->

```shell
# Every node running IOMesh must have an IP address belonging to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el8.sh | sh -
```
<!--END_DOCUSAURUS_CODE_TABS-->

Wait for minutes. IOMesh will be installed successfully if all IOMesh Cluster pods are running. 

```shell
watch kubectl get --namespace iomesh-system pods
```

IOMesh has been installed successfully!

> **_NOTE_: IOMesh resources installed by running the entered script will be reserved for future troubleshooting if any error occurs during installation. You may enter the script below to remove all IOMesh resources from the Kubernetes Cluster: `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -`**

## Customized Installation Guide

For installation with customized configurations, follow the steps below.

### Install Helm3

> **_NOTE_: Skip this step if Helm3 is already installed.**

```shell
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

For more details, please refer to **[Install Helm](https://helm.sh/docs/intro/install/)**.

### Set Up Helm Repo

```shell
helm repo add iomesh http://iomesh.com/charts
```

### Install IOMesh

1. Download `iomesh.yaml` with default configurations.

    ```shell
    helm show values iomesh/iomesh > iomesh.yaml
    ```

2. Customize `iomesh.yaml`.

   **(required)** Fill in `dataCIDR` according to your network.

    ```yaml
    iomesh:
      chunk:
        dataCIDR: "10.234.1.0/24" # change to your own data network CIDR
    ```

    **(optional)** Configure the deployment mode for the cluster, and the default is hybrid-flash deployment. For all-flash deployment, you need to set `diskDeploymentMode` to `allFlash`.

    ```yaml
    diskDeploymentMode: "hybridFlash" # set `diskDeploymentMode` to `allFlash` in all-flash deployment mode
    ```
   
   **(optional)** If you simply want IOMesh to utilize part of Kubernetes nodes, configure the labels of nodes to be utilized in `chunk.podPolicy.affinity`. For example:
   
   ```yaml
   iomesh:
     chunk:
       podPolicy:
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
               - matchExpressions:
                 - key: kubernetes.io/hostname # specific node label's key
                   operator: In
                   values:
                   - iomesh-worker-0 # specific node label's value
                   - iomesh-worker-1
    ```
    For more information about pod affinity rules, see: [pod affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity).

3. Install IOMesh Cluster.

    > **_NOTE_: Replace `iomesh` with your release name.**

    ```shell
    helm install iomesh iomesh/iomesh \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh.yaml \
        --wait
    ```

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

4.  Run `kubectl --namespace iomesh-system get pods` to check the results.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    ```output
    NAME                                                  READY   STATUS    RESTARTS   AGE
    csi-driver-controller-plugin-89b55d6b5-8r2fc          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-d4rbr          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-n5s48          6/6     Running   10         2m8s
    csi-driver-node-plugin-9wccv                          3/3     Running   2          2m8s
    csi-driver-node-plugin-mbpnk                          3/3     Running   2          2m8s
    csi-driver-node-plugin-x6qrk                          3/3     Running   2          2m8s
    iomesh-chunk-0                                        3/3     Running   0          52s
    iomesh-chunk-1                                        3/3     Running   0          47s
    iomesh-chunk-2                                        3/3     Running   0          43s
    iomesh-hostpath-provisioner-8fzvj                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-gfl9k                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-htzx9                     1/1     Running   0          2m8s
    iomesh-iscsi-redirector-96672                         2/2     Running   1          55s
    iomesh-iscsi-redirector-c2pwm                         2/2     Running   1          55s
    iomesh-iscsi-redirector-pcx8c                         2/2     Running   1          55s
    iomesh-meta-0                                         2/2     Running   0          55s
    iomesh-meta-1                                         2/2     Running   0          55s
    iomesh-meta-2                                         2/2     Running   0          55s
    iomesh-openebs-ndm-5457z                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-599qb                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-cluster-exporter-68c757948-gszzx   1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-kzjfc                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-qc9pt                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-v7sh7                1/1     Running   0          2m8s
    iomesh-openebs-ndm-operator-56cfb5d7b6-srfzm          1/1     Running   0          2m8s
    iomesh-openebs-ndm-svp9n                              1/1     Running   0          2m8s
    iomesh-zookeeper-0                                    1/1     Running   0          2m3s
    iomesh-zookeeper-1                                    1/1     Running   0          102s
    iomesh-zookeeper-2                                    1/1     Running   0          76s
    iomesh-zookeeper-operator-7b5f4b98dc-6mztk            1/1     Running   0          2m8s
    operator-85877979-66888                               1/1     Running   0          2m8s
    operator-85877979-s94vz                               1/1     Running   0          2m8s
    operator-85877979-xqtml                               1/1     Running   0          2m8s
    ```

IOMesh Cluster is now installed successfully. Please go to [Setup IOMesh](setup-iomesh.md).

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network

## Install IOMesh Offline

### Prepare Offline Installation Package
1. Download [IOMesh offline installation package](https://download.smartx.com/iomesh-offline-v0.11.1.tgz).

2. Decompress the offline installation package
    ```shell
    tar -xf  iomesh-offline-v0.11.1.tgz && cd iomesh-offline
    ```

### Load Images
Load IOMesh images on each Kubernetes worker node, then execute the corresponding image load script according to your container runtime and container management tools. 
<!--DOCUSAURUS_CODE_TABS-->

<!--Docker-->
```shell
docker load --input ./images/iomesh-offline-images.tar
```
<!--Containerd-->
```shell
ctr --namespace k8s.io image import ./images/iomesh-offline-images.tar
```

<!--Podman-->
```shell
podman load --input ./images/iomesh-offline-images.tar
```

<!--END_DOCUSAURUS_CODE_TABS-->

### Install IOMesh Using Offline Installation Package

#### Install IOMesh

1. Download `iomesh.yaml` with default configurations.

    ```shell
    ./helm show values charts/iomesh > iomesh.yaml
    ```

2. Customize `iomesh.yaml`.

   **(required)** Fill in `dataCIDR` according to your network.

    ```yaml
    iomesh:
      chunk:
        dataCIDR: "10.234.1.0/24" # change to your own data network CIDR
    ```

    **(optional)** If you simply want IOMesh to utilize part of Kubernetes nodes, configure the labels of nodes to be utilized in `chunk.podPolicy.affinity`. For example:
   
   ```yaml
   iomesh:
     chunk:
       podPolicy:
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
               - matchExpressions:
                 - key: kubernetes.io/hostname # specific node label's key
                   operator: In
                   values:
                   - iomesh-worker-0 # specific node label's value
                   - iomesh-worker-1
    ```
    For more information about pod affinity configuration rules, see: [pod affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)

3. Install the IOMesh cluster.

    ```shell
    ./helm install iomesh ./charts/iomesh \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh.yaml \
        --wait
    ```

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

4. Run `kubectl --namespace iomesh-system get pods` to check the result.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    ```output
    NAME                                                   READY   STATUS    RESTARTS   AGE
    iomesh-chunk-0                                         3/3     Running   0          102s
    iomesh-chunk-1                                         3/3     Running   0          98s
    iomesh-chunk-2                                         3/3     Running   0          94s
    iomesh-csi-driver-controller-plugin-5b66557959-jhshb   6/6     Running   10         3m20s
    iomesh-csi-driver-controller-plugin-5b66557959-p4m9x   6/6     Running   10         3m20s
    iomesh-csi-driver-controller-plugin-5b66557959-w9qbq   6/6     Running   10         3m20s
    iomesh-csi-driver-node-plugin-6pjpn                    3/3     Running   2          3m20s
    iomesh-csi-driver-node-plugin-dj2cd                    3/3     Running   2          3m20s
    iomesh-csi-driver-node-plugin-stbdw                    3/3     Running   2          3m20s
    iomesh-hostpath-provisioner-55j8t                      1/1     Running   0          3m20s
    iomesh-hostpath-provisioner-c7jlz                      1/1     Running   0          3m20s
    iomesh-hostpath-provisioner-jqrsd                      1/1     Running   0          3m20s
    iomesh-iscsi-redirector-675vr                          2/2     Running   1          119s
    iomesh-iscsi-redirector-d2j4m                          2/2     Running   1          119s
    iomesh-iscsi-redirector-sjfjk                          2/2     Running   1          119s
    iomesh-meta-0                                          2/2     Running   0          104s
    iomesh-meta-1                                          2/2     Running   0          104s
    iomesh-meta-2                                          2/2     Running   0          104s
    iomesh-openebs-ndm-569pb                               1/1     Running   0          3m20s
    iomesh-openebs-ndm-9fhln                               1/1     Running   0          3m20s
    iomesh-openebs-ndm-cluster-exporter-68c757948-vkkdz    1/1     Running   0          3m20s
    iomesh-openebs-ndm-m64j5                               1/1     Running   0          3m20s
    iomesh-openebs-ndm-node-exporter-2brc6                 1/1     Running   0          3m20s
    iomesh-openebs-ndm-node-exporter-g97q5                 1/1     Running   0          3m20s
    iomesh-openebs-ndm-node-exporter-kvn88                 1/1     Running   0          3m20s
    iomesh-openebs-ndm-operator-56cfb5d7b6-gwlg9           1/1     Running   0          3m20s
    iomesh-zookeeper-0                                     1/1     Running   0          3m14s
    iomesh-zookeeper-1                                     1/1     Running   0          2m59s
    iomesh-zookeeper-2                                     1/1     Running   0          2m20s
    iomesh-zookeeper-operator-7b5f4b98dc-fxfb6             1/1     Running   0          3m20s
    operator-85877979-5fvvn                                1/1     Running   0          3m20s
    operator-85877979-74rl6                                1/1     Running   0          3m20s
    operator-85877979-cvgcz                                1/1     Running   0          3m20s
    ```

IOMesh Cluster has been installed successfully. Please go to [Setup IOMesh](setup-iomesh.md).

## Install IOMesh on OpenShift Container Platform

You may also install and use IOMesh through the IOMesh Operator on the OperatorHub page of the Red Hat OpenShift Container Platform.

### Pre-Install

Run the script below, which will install the dependencies of the IOMesh Operator and configure IOMesh specifications and settings for the OpenShift Cluster. Note that the script should be executed in an environment where oc or kubectl can access the OpenShift Cluster. 

```shell
curl -sSL https://iomesh.run/iomesh-operator-pre-install-openshift.sh | sh -
```

### Install IOMesh Operator

1. Log in to the OpenShift Container Platform, then open the OperatorHub page. On the OperatorHub page, select IOMesh Operator and click Install to install IOMesh Operator.

2. Select following the order: the Installed Operators > IOMesh Operator > Create instance > YAML view, then fill in IOMesh Custom Resources according to IOMesh [YAML](https://iomesh.run/iomesh.yaml). Change the spec.*.dataCIDR to your data network CIDR.

### Install CSI Driver

Run the script below to install IOMesh CSI Driver. Note that the script should be executed in an environment where oc or kubectl can access the OpenShift Cluster.

```shell
curl -sSL https://iomesh.run/iomesh-operator-post-install-openshift.sh | sh -
```
    
IOMesh Cluster is installed successfully. Please go to [Setup IOMesh](setup-iomesh.md).
